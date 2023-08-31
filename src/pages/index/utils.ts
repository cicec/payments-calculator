const principal = [500000];
const interestRate = 0.035;
const income = [300000];
const incomeIncreaseRate = 0.06;
const consumption = [100000];
const consumptionIncreaseRate = 0.04;

const lastOf = <T>(list: Array<T>) => list[list.length - 1];

const pick = (years: number) => {
  for (let i = 0; i < years; i++) {
    principal.push(
      lastOf(principal) +
        (lastOf(principal) * interestRate +
          lastOf(income) -
          lastOf(consumption))
    );

    income.push(lastOf(income) * (1 + incomeIncreaseRate));
    consumption.push(lastOf(consumption) * (1 + consumptionIncreaseRate));
  }
};

console.log(pick(10), principal, income, consumption);

// export default {};
