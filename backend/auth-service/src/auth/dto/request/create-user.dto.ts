export class CreateUserDTO {
  private firstName: string;
  private lastName: string;
  private email: string;
  private password: string;

  constructor(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
  }

  public getName(): string {
    return this.firstName + ' ' + this.lastName;
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public setFirstName(firstName: string): this {
    this.firstName = firstName;
    return this;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public setLastName(lastName: string): this {
    this.lastName = lastName;
    return this;
  }

  public getEmail(): string {
    return this.email;
  }

  public setEmail(email: string): this {
    this.email = email;
    return this;
  }

  public getPassword(): string {
    return this.password;
  }

  public setPassword(password: string): void {
    this.password = password;
  }
}
