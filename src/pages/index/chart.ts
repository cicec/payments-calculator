import { Chart, registerables } from 'chart.js';
import _ from 'lodash';

import { Configuration } from './interfaces';
import { exec } from './utils';

Chart.register(...registerables);

export class ChartHelper {
  chart: Chart | null = null;

  init(el: HTMLCanvasElement) {
    const context = el.getContext('2d');

    if (!context) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(context, {
      type: 'line',
      data: {
        labels: [],
        datasets: [],
      },
      options: {
        responsive: true,
        interaction: {
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  render(configuration: Configuration) {
    if (!this.chart) {
      return;
    }

    const {
      numberOfYears,
      annualizedRate,
      incomeIncreaseRate,
      inflationRate,
      maximumIncome,
      minimumIncome,
      minimumIncomeIncreaseRate,
      workingYears,
    } = configuration;

    const Datasets: {
      totalAssets: number[];
      passiveIncome: number[];
      income: number[];
      expense: number[];
    } = {
      totalAssets: [configuration.totalAssets],
      passiveIncome: [configuration.totalAssets * (configuration.annualizedRate / 100)],
      income: [configuration.income],
      expense: [configuration.expense],
    };

    Array.from({ length: numberOfYears }).forEach((_value, index) => {
      const year = index + 1;
      const {
        totalAssets: previousTotalAssets,
        income: previousIncome,
        expense: previousExpense,
      } = _.mapValues(Datasets, dataset => _.last(dataset) as number);

      const income = exec(() => {
        if (year >= workingYears) {
          if (year === workingYears) {
            return minimumIncome;
          } else {
            return previousIncome * (1 + minimumIncomeIncreaseRate / 100);
          }
        } else {
          const nextIncome = previousIncome * (1 + incomeIncreaseRate / 100);

          if (nextIncome >= maximumIncome) {
            return maximumIncome;
          } else {
            return nextIncome;
          }
        }
      });

      const expense = previousExpense * (1 + inflationRate / 100);
      const passiveIncome = previousTotalAssets * (annualizedRate / 100);
      const totalAssets =
        previousTotalAssets + (previousTotalAssets * annualizedRate) / 100 + income - expense;

      Datasets.income.push(income);
      Datasets.expense.push(expense);
      Datasets.passiveIncome.push(passiveIncome);
      Datasets.totalAssets.push(totalAssets);
    });

    this.chart.data = {
      labels: Array.from({ length: numberOfYears }).map((_, index) => `第${index + 1}年`),
      datasets: [
        {
          label: '总存款',
          data: Datasets.totalAssets,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
        },
        {
          label: '主动收入',
          data: Datasets.income,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
        },
        {
          label: '被动收入',
          data: Datasets.passiveIncome,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
        },
        {
          label: '支出',
          data: Datasets.expense,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
        },
      ],
    };

    this.chart.update();
  }
}
