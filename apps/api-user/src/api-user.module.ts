import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { FileModule } from './files/file.module';
import { CategoryModule } from './category/category.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { NoteModule } from './notes/notes.module';

@Module({
  imports: [UserModule, ProjectModule, FileModule, CategoryModule, SubscriptionModule, NoteModule],
  controllers: [],
  providers: [],
})
export class ApiUserModule {}
