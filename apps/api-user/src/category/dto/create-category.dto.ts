import { Category } from "@app/api-commons/schemas/category.schema";

export class CreateCategoryDto {
    name: string;
    image: string;

    toModel() {
        const model = new Category();
        model.name = this.name;
        model.image = this.image;
        return model;
    }
}
