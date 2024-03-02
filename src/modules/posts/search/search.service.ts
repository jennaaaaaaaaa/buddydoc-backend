import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { SearchInterfaces } from './search.interfaces';
// import { SearchResponse } from './search.interfaces';
@Injectable()
export class SearchService {
  private readonly indexName = 'title_content';

  constructor(
    private prisma: PrismaService,
    private elasticsearchService: ElasticsearchService // 주입합니다.
  ) {}

  async deleteIndex() {
    return this.elasticsearchService.indices.delete({
      index: this.indexName,
    });
  }

  async initIndex() {
    return this.elasticsearchService.indices.create({
      index: this.indexName,
    });
  }

  async indexExists() {
    return this.elasticsearchService.indices.exists({
      index: this.indexName,
    });
  }

  async initMapping() {
    return this.elasticsearchService.indices.putMapping({
      index: this.indexName,
      body: {
        properties: {
          postTitle: { type: 'text' },
          content: { type: 'text' },
          createdAt: { type: 'date' }, // 추가
          postId: { type: 'integer' }, // 추가
          deletedAt: { type: 'date' }, // 추가
        },
      },
    });
  }

  async postSearch(search: string, pageCursor?: string) {
    if (!search || typeof search !== 'string') {
      throw new Error('Invalid search parameter');
    }

    let body: any = {
      query: {
        bool: {
          should: [{ match: { title: search } }, { match: { content: search } }],
          filter: {
            bool: {
              must_not: {
                exists: {
                  field: 'deletedAt',
                },
              },
            },
          },
          minimum_should_match: 1,
        },
      },
      sort: [{ createdAt: 'desc' }, { postId: 'desc' }],
      size: 3,
    };

    // 페이지 커서가 있다면 search_after에 추가
    if (pageCursor) {
      const pageCursorValues = pageCursor.split(',');

      body.search_after = pageCursorValues;
    }

    // console.log('pageCursor', pageCursor);
    // console.log('pageCursorValues', pageCursorValues);

    // console.log('body.search_after', body.search_after);

    const result = (await this.elasticsearchService.search({
      index: this.indexName,
      body,
    })) as unknown as SearchInterfaces;

    // console.log('body', body);
    // console.log('result.hits', result.hits);

    let options = result.hits.hits;

    // console.log('options', options.map((option) => ));

    // 다음 페이지 커서 생성
    let lastPageCursor;
    if (options.length > 0) {
      const lastOption = options[options.length - 1];
      // console.log('lastOption._source.postIdlastOption._source.postId ===>>>>', lastOption._source);
      lastPageCursor = [lastOption._source.postId]; // 현재 마지막 문서의 'createdAt'과 'postId'
    }

    let isLastPage = options.length < body.size;

    if (options.length === 0) {
      return { message: '검색 결과가 없습니다.', options: [] };
    }

    return { options, lastPageCursor, isLastPage };
  }

  async init() {
    const exists = await this.indexExists();
    if (exists) {
      await this.deleteIndex();
    }

    await this.initIndex();
    await this.initMapping();

    const posts = await this.prisma.posts.findMany();

    await this.addDocument(posts);
  }

  async checkExistence(postTitle: string, content: string) {
    try {
      if (!postTitle || !content) {
        console.error('Title or content is missing');
        return false;
      }

      const result = (await this.elasticsearchService.search({
        index: this.indexName,
        body: {
          query: {
            bool: {
              must: [{ match: { postTitle: postTitle } }, { match: { content: content } }],
            },
          },
        },
      })) as any;

      if (
        !result.body ||
        !result.body.hits ||
        (!result.body.hits.total && !result.body.suggest.docsuggest[0].options.length)
      ) {
        // console.log(`No search results for title: ${postTitle}, content: ${content}`);
        return false;
      }

      return result.body.hits.total.value > 0;
    } catch (error) {
      console.error(`Error occurred in Elasticsearch query for title: ${postTitle}, content: ${content}`, error);
      return false;
    }
  }

  async addDocument(posts: any[]) {
    return Promise.all(
      posts.map(async (post) => {
        if (!post.postTitle || !post.content) {
          console.error('Title or content is missing in post:', post);
          return null;
        }

        const user = await this.prisma.users.findUnique({ where: { userId: +post.post_userId } });
        const userNickname = user ? user.userNickname : 'Unknown';

        let response;
        const exists = await this.checkExistence(post.postTitle, post.content);

        if (!exists) {
          try {
            response = await this.elasticsearchService.index({
              index: this.indexName,
              id: post.postId,
              body: {
                postId: post.postId,
                title: post.postTitle,
                content: post.content,
                position: post.position ? post.position.split(',') : [],
                postType: post.postType,
                skillList: post.skillList ? post.skillList.split(',') : [],
                preference: post.preference,
                views: post.views,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                deletedAt: post.deletedAt,
                deadLine: post.deadLine,
                startDate: post.startDate,
                memberCount: post.memberCount,
                period: post.period,
                userNickname: userNickname,
                profileImage: user.profileImage,
                suggest: {
                  input: [...post.postTitle.split(' '), ...post.content.split(' ')],
                },
              },
            });
            // console.log(`Document added successfully for title: ${post.postTitle}, content: ${post.content}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            return response;
          } catch (error) {
            console.error(
              `Error occurred while adding document for title: ${post.postTitle}, content: ${post.content}`,
              error
            );
          }
        }
        return null;
      })
    );
  }

  // async updateDocument(id: number, post: any) {
  //   console.log('id, post ===>>>>', id, post);
  //   return this.elasticsearchService.update({
  //     index: this.indexName,
  //     id: String(id),
  //     body: {
  //       doc: {
  //         title: post.postTitle,
  //         content: post.content,
  //         suggest: {
  //           input: [...post.postTitle.split(' '), ...post.content.split(' ')],
  //         },
  //       },
  //     },
  //   });
  // }

  async updateDocument(id: number, post: any) {
    // 문서가 존재하는지 확인
    const isExists = await this.elasticsearchService.exists({
      index: this.indexName,
      id: String(id),
    });

    if (isExists) {
      // 문서가 존재하면 업데이트
      return this.elasticsearchService.update({
        index: this.indexName,
        id: String(id),
        body: {
          doc: {
            title: post.postTitle,
            content: post.content,
            // suggest: {
            //   input: [...post.postTitle.split(' '), ...post.content.split(' ')],
            // },
          },
        },
      });
    } else {
      // 문서가 존재하지 않으면 새로 추가
      return this.elasticsearchService.create({
        index: this.indexName,
        id: String(id),
        body: {
          title: post.postTitle,
          content: post.content,
          // suggest: {
          //   input: [...post.postTitle.split(' '), ...post.content.split(' ')],
          // },
        },
      });
    }
  }

  async deleteDoc(id: number) {
    console.log('deleteDoc ====>>> id:', id);
    // 문서가 존재하는지 확인
    const isExists = await this.elasticsearchService.exists({
      index: this.indexName,
      id: String(id),
    });

    if (isExists) {
      // 문서가 존재하면 삭제
      return this.elasticsearchService.delete({
        index: this.indexName,
        id: String(id),
      });
    }
  }
}
