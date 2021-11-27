import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user: User;

describe("Show profile", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    user = await createUserUseCase.execute({
      email: "user@example.com",
      password: "password",
      name: "test name",
    });
  });

  it("should return user profile given its id", async () => {
    const returnedUser = await showUserProfileUseCase.execute(String(user.id));

    expect(returnedUser).toMatchObject(user);
  });

  it("should not return user profile given an non-existing id", async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("fake id");
    }).rejects.toBeInstanceOf(AppError);
  });
});
