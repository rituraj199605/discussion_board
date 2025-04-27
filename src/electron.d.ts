// tweet-app/src/electron.d.ts
interface ElectronAPI {
    tweetStorage: {
      getTweets: () => Promise<any[]>;
      saveTweets: (tweets: any[]) => Promise<boolean>;
      deleteTweet: (tweetId: number) => Promise<any[]>;
    };
    fileSystem: {
      saveFile: (content: string, defaultPath: string) => Promise<string | null>;
    };
  }
  
  declare global {
    interface Window {
      electron: ElectronAPI;
    }
  }
  
  export {};