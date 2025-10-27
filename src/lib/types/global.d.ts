// global.d.ts
declare namespace NodeJS {
    interface Global {
        mongoose: {
            conn: any;
            promise: any;
        };
    }
}
  