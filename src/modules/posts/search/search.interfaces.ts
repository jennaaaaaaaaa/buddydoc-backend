export interface SuggestOptions {
  text: string;
  _index: string;
  _id: string;
  _score: number;
  _source: Record<string, any>;
}

interface Docsuggest {
  text: string;
  offset: number;
  length: number;
  options: SuggestOptions[];
}

interface Suggest {
  docsuggest: Docsuggest[];
}

export interface SearchInterfaces {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number | null;
    hits: Array<Record<string, any>>;
  };
  suggest: Suggest;
}
