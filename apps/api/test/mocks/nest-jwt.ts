export class JwtService {
  async signAsync(payload: unknown): Promise<string> {
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  async verifyAsync<T>(token: string): Promise<T> {
    return JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as T;
  }
}

export class JwtModule {
  static registerAsync() {
    return {
      module: JwtModule,
      providers: [JwtService],
      exports: [JwtService],
    };
  }
}
