import { Module, NestFactory, NestExpressApplication, INestApplication, DynamicModule, ValidationPipe } from '@karhdo/nestjs-core';
import * as bodyParser from 'body-parser';

import AppOptions from './app.interface';

@Module({})
export class AppModule {
  private static options: AppOptions;
  private static instance: INestApplication;

  public static async bootstrap(options?: AppOptions): Promise<void> {
    this.options = options;

    this.instance = await this.createApplicationInstance();

    await this.listen();
  }

  public static getInstance(): INestApplication {
    if (!this.instance) {
      throw new Error('Application instance is not configured');
    }

    return this.instance;
  }

  private static async listen(): Promise<void> {
    const app = this.getInstance();

    await app.listen(3080);

    console.log(`Http service is starting on port 3080`);
  }

  private static enableTrustedProxy(app: NestExpressApplication): void {
    app.set('trust proxy', 1);
  }

  private static setupCors(app: NestExpressApplication): void {
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.enableCors();
  }

  private static async createApplicationInstance(): Promise<INestApplication> {
    const entryModule = this.buildEntryModule();

    const app = await NestFactory.create<NestExpressApplication>(entryModule);

    this.enableTrustedProxy(app);

    this.setupCors(app);

    app.useGlobalPipes(new ValidationPipe({
      transform: true
    }));

    return app;
  }

  private static buildEntryModule(): DynamicModule {
    return {
      global: true,
      module: AppModule,
      imports: this.buildImportModule(),
      controllers: this.buildController(),
      providers: [],
      exports: []
    };
  }

  private static buildController() {
    const { controllers } = this.options;

    return controllers;
  }

  private static buildImportModule() {
    const { imports: importedModules = [] } = this.options;

    const defaultModules = [];

    return [
      ...defaultModules,
      ...importedModules
    ];
  }
}
