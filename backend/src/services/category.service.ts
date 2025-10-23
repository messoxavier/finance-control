import { categoryRepository } from "../repositories/category.repository";
import { CreateCategoryInput } from "../schemas/category.schema";

export const categoryService = {
  async list(userId: number) {
    return categoryRepository.listByUser(userId);
  },

  async create(userId: number, payload: CreateCategoryInput) {
    const exists = await categoryRepository.findByName(
      userId,
      payload.name.trim(),
      payload.type
    );
    if (exists) {
      throw Object.assign(new Error("Já existe uma categoria com esse nome e tipo."), { status: 409 });
    }

    return categoryRepository.create({
      userId,
      name: payload.name.trim(),
      type: payload.type
    });
  }
};
