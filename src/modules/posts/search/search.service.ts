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
          suggest: {
            type: 'completion',
            analyzer: 'simple',
            search_analyzer: 'simple',
          },
        },
      },
    });
  }

  async postSearch(search: string) {
    // console.log('검색한 키워드 searchService =>>>> search:', search);
    if (!search || typeof search !== 'string') {
      throw new Error('Invalid search parameter');
    }

    const result = (await this.elasticsearchService.search({
      index: this.indexName,
      body: {
        suggest: {
          docsuggest: {
            prefix: search,
            completion: {
              field: 'suggest',
              fuzzy: {
                fuzziness: 'auto',
              },
            },
          },
        },
      },
    })) as unknown as SearchInterfaces;

    let options = result.suggest.docsuggest[0].options;
    return options;
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
                title: post.postTitle,
                content: post.content,
                position: post.position ? post.position.split(',') : [],
                postType: post.postType,
                skillList: post.skillList ? post.skillList.split(',') : [],
                preference: post.preference,
                views: post.views,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                deadLine: post.deadLine,
                startDate: post.startDate,
                memberCount: post.memberCount,
                period: post.period,
                userNickname: userNickname,
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
            suggest: {
              input: [...post.postTitle.split(' '), ...post.content.split(' ')],
            },
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
          suggest: {
            input: [...post.postTitle.split(' '), ...post.content.split(' ')],
          },
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

// import { Injectable } from '@nestjs/common';
// import { Client } from '@elastic/elasticsearch';
// import { PrismaService } from '../../../database/prisma/prisma.service';

// @Injectable()
// export class SearchService {
//   private readonly elasticClient: Client;
//   private readonly indexName = 'title_content'; //인덱스 이름 저장

//   // @elastic/elasticsearch 라이브러리에서는 클라이언트 옵션 중 log 옵션을 지원하지않음 대신 로깅을 위해 별도의 로깅 시스템을 사용
//   constructor(private prisma: PrismaService) {
//     this.elasticClient = new Client({
//       node: 'http://localhost:9200',
//       // log: 'info',
//     });
//   }

//   //인덱스 삭제
//   async deleteIndex() {
//     return this.elasticClient.indices.delete({
//       index: this.indexName,
//     });
//   }

//   //인덱스 생성
//   async initIndex() {
//     return this.elasticClient.indices.create({
//       index: this.indexName,
//     });
//   }

//   //인덱스 존재 여부
//   async indexExists() {
//     return this.elasticClient.indices.exists({
//       index: this.indexName,
//     });
//   }

//   async initMapping() {
//     return this.elasticClient.indices.putMapping({
//       index: this.indexName,
//       body: {
//         properties: {
//           //title이랑 content라는 필드 타입은text
//           postTitle: { type: 'text' },
//           content: { type: 'text' },
//           suggest: {
//             type: 'completion', //자동완성기능
//             analyzer: 'simple', //문서가 인덱싱 될 때 사용하는 분석기
//             search_analyzer: 'simple', //검색시 사용되는 분석기, 대소문자 구별 x, 공백기준으로 텍스트 분리
//           },
//         },
//       },
//     });
//   }

//   async postSearch(search: string) {
//     return this.elasticClient.search({
//       index: this.indexName,
//       body: {
//         suggest: {
//           docsuggest: {
//             prefix: search, //사용자가 입력한 검색어
//             completion: {
//               field: 'suggest',
//               fuzzy: {
//                 //부분 일치 검색을 활성화하는 옵션
//                 fuzziness: 'auto', //검색어와 약간 다른 단어도 결과에 포함
//               },
//             },
//           },
//         },
//       },
//     });
//   }

//   async init() {
//     const exists = await this.indexExists();
//     if (exists) {
//       await this.deleteIndex();
//     }

//     await this.initIndex();
//     await this.initMapping();

//     const posts = await this.prisma.posts.findMany();

//     await this.addDocument(posts);
//   }

//   ////elasticsearch내의 해당 인덱스의 document 중복체크
//   async checkExistence(postTitle: string, content: string) {
//     try {
//       if (!postTitle || !content) {
//         console.error('Title or content is missing');
//         return false;
//       }

//       const result = (await this.elasticClient.search({
//         index: this.indexName,
//         body: {
//           query: {
//             bool: {
//               must: [{ match: { title: postTitle } }, { match: { content: content } }],
//             },
//           },
//         },
//       })) as any;

//       if (!result.body || !result.body.hits || !result.body.hits.total) {
//         console.log(`No search results for title: ${postTitle}, content: ${content}`);
//         return false;
//       }

//       return result.body.hits.total.value > 0;
//     } catch (error) {
//       console.error(`Error occurred in Elasticsearch query for title: ${postTitle}, content: ${content}`, error);
//       return false; // 오류가 발생하면 'false'를 반환
//     }
//   }

//   async addDocument(posts: any[]) {
//     return Promise.all(
//       posts.map(async (post) => {
//         if (!post.postTitle || !post.content) {
//           console.error('Title or content is missing in post:', post);
//           return null;
//         }
//         let response;
//         const exists = await this.checkExistence(post.postTitle, post.content);

//         if (!exists) {
//           try {
//             response = await this.elasticClient.index({
//               index: this.indexName,
//               body: {
//                 title: post.postTitle,
//                 content: post.content,
//                 suggest: {
//                   input: [...post.postTitle.split(' '), ...post.content.split(' ')],
//                 },
//               },
//             });
//             console.log(`Document added successfully for title: ${post.postTitle}, content: ${post.content}`);
//             await new Promise((resolve) => setTimeout(resolve, 1000));
//             return response;
//           } catch (error) {
//             console.error(
//               `Error occurred while adding document for title: ${post.postTitle}, content: ${post.content}`,
//               error
//             );
//           }
//         }
//         return null;
//       })
//     );
//   }
// }
