interface Window {
  createLemonSqueezy?: () => void;
  LemonSqueezy?: {
    Url: {
      Open: (url: string) => void;
    };
    Setup: () => void;
  };
}
