import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user: User;

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let statements: Statement[] = [];

let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Get Balance", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );

    user = await createUserUseCase.execute({
      email: "user@example.com",
      password: "password",
      name: "test name",
    });

    statements.push(
      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: "deposit" as OperationType,
        amount: 100,
        description: "description",
      })
    );
  });

  it("should get balance", async () => {
    const balance = await getBalanceUseCase.execute({
      user_id: String(user.id),
    });

    console.log(balance);
    expect(balance.balance).toEqual(100);
    expect(balance.statement).toEqual(statements);
  });

  it("should not get balance of a non-existent user", async () => {
    expect(async () => {
      await getBalanceUseCase.execute({
        user_id: "fake_id",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
