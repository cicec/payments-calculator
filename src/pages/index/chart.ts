import { Chart, registerables } from 'chart.js';
import _ from 'lodash';

import { Configuration } from './interfaces';

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
      const { totalAssets, income, expense } = _.mapValues(
        Datasets,
        dataset => _.last(dataset) as number
      );

      Datasets.totalAssets.push(
        totalAssets + (totalAssets * annualizedRate) / 100 + income - expense
      );
      Datasets.passiveIncome.push(totalAssets * (annualizedRate / 100));
      Datasets.expense.push(expense * (1 + inflationRate / 100));

      if (year > workingYears) {
        if (year === workingYears + 1) {
          Datasets.income.push(minimumIncome);
        } else {
          Datasets.income.push(income * (1 + minimumIncomeIncreaseRate / 100));
        }
      } else {
        const nextIncome = income * (1 + incomeIncreaseRate / 100);

        if (nextIncome >= maximumIncome) {
          Datasets.income.push(maximumIncome);
        } else {
          Datasets.income.push(nextIncome);
        }
      }
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
