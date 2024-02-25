// import { Injectable } from '@nestjs/common';
// import { Client } from '@elastic/elasticsearch';

// @Injectable()
// export class ElasticsearchService {
//   private readonly elasticClient: Client;
//   private readonly indexName = 'title_content';

//   // @elastic/elasticsearch 라이브러리에서는 클라이언트 옵션 중 log 옵션을 지원하지않음 대신 로깅을 위해 별도의 로깅 시스템을 사용
//   constructor() {
//     this.elasticClient = new Client({
//       node: 'http://localhost:9200',
//       // log: 'info',
//     });
//   }

//   async deleteIndex() {
//     return this.elasticClient.indices.delete({
//       index: this.indexName,
//     });
//   }

//   async initIndex() {
//     return this.elasticClient.indices.create({
//       index: this.indexName,
//     });
//   }

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
//           brandName: { type: 'text' },
//           menuName: { type: 'text' },
//           suggest: {
//             type: 'completion',
//             analyzer: 'simple',
//             search_analyzer: 'simple',
//           },
//         },
//       },
//     });
//   }

//   async getSuggestions(name) {
//     return this.elasticClient.search({
//       index: this.indexName,
//       body: {
//         suggest: {
//           docsuggest: {
//             prefix: name,
//             completion: {
//               field: 'suggest',
//               fuzzy: {
//                 fuzziness: 'auto',
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
//     await this.addDocument();
//   }

//   async checkExistence(brandName: string, menuName: string) {
//     try {
//       if (!brandName || !menuName) {
//         console.error('brandName or menuName is missing');
//         return;
//       }

//       const result = await this.elasticClient.search({
//         index: this.indexName,
//         body: {
//           query: {
//             match_all: {},
//           },
//         },
//       });

//       if (!result.body || !result.body.hits || !result.body.hits.total) {
//         console.log(`No search results for brandName: ${brandName}, menuName: ${menuName}`);
//         return false;
//       }

//       return result.body.hits.total.value > 0;
//     } catch (error) {
//       console.error(`Error occurred in Elasticsearch query for brandName: ${brandName}, menuName: ${menuName}`, error);
//     }
//   }

//   async addDocument(restaurants: any[]) {
//     return Promise.all(
//       restaurants.map((restaurant) => {
//         return Promise.all(
//           restaurant.menus.map(async (menu) => {
//             let response;
//             const exists = await this.checkExistence(restaurant.brandName, menu.menuName);

//             if (!exists) {
//               try {
//                 response = await this.elasticClient.index({
//                   index: this.indexName,
//                   body: {
//                     brandName: restaurant.brandName,
//                     menuName: menu.menuName,
//                     suggest: {
//                       input: [restaurant.brandName, ...menu.menuName.split(' ')],
//                     },
//                   },
//                 });
//                 console.log(`Document added successfully for brandName: ${restaurant.brandName}, menuName: ${menu.menuName}`);
//                 await new Promise((resolve) => setTimeout(resolve, 1000));
//               } catch (error) {
//                 console.error(`Error occurred while adding document for brandName: ${restaurant.brandName}, menuName: ${menu.menuName}`, error);
//               }
//             }
//             return response;
//           })
//         );
//       })
//     );
//   }

// }
