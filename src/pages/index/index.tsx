import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Input } from '@nextui-org/react';
import { Chart, registerables } from 'chart.js';
import _ from 'lodash';

import style from './index.module.less';

Chart.register(...registerables);

const IndexPage: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const [configuration, setConfiguration] = useState({
    numberOfYears: 30,
    totalAssets: 10,
    annualizedRate: 20,
    income: 20,
    incomeIncreaseRate: 8,
    expense: 10,
    inflationRate: 4,
    maximumIncome: 50,
    minimumIncome: 0,
    workingYears: 10,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');

    if (!canvas || !context) {
      return;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(context, {
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
  }, []);

  useEffect(() => {
    const chart = chartRef.current;

    if (!chart) {
      return;
    }

    const {
      numberOfYears,
      annualizedRate,
      incomeIncreaseRate,
      inflationRate,
      maximumIncome,
      minimumIncome,
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
        Datasets.income.push(minimumIncome);
      } else if (income >= maximumIncome) {
        Datasets.income.push(maximumIncome);
      } else {
        Datasets.income.push(income * (1 + incomeIncreaseRate / 100));
      }
    });

    chart.data = {
      labels: Array.from({ length: numberOfYears }).map((_, index) => `第${index + 1}年`),
      datasets: [
        {
          label: '总存款',
          data: Datasets.totalAssets,
          fill: false,
          cubicInterpolationMode: 'monotone',
          tension: 0.4,
        },
        // {
        //   label: '年收入',
        //   data: Datasets.income,
        //   fill: false,
        //   cubicInterpolationMode: 'monotone',
        //   tension: 0.4,
        // },
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

    chart.update();
  }, [configuration]);

  const bindChangeEvent = useCallback((field: string) => {
    return <T extends HTMLInputElement>(e: React.ChangeEvent<T>) => {
      const value = _.toNumber(e.target.value);

      setConfiguration({ ...configuration, [field]: value });
    };
  }, []);

  return (
    <div className={style.container}>
      <div className={style.preview}>
        <canvas ref={canvasRef}></canvas>
      </div>

      <div className={style.configuration}>
        <div className={style.row}>
          <Input
            value={String(configuration.numberOfYears)}
            type="number"
            label="计算年限"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">共</span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">年</span>
              </div>
            }
            onChange={bindChangeEvent('numberOfYears')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.totalAssets)}
            type="number"
            label="现有存款"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">￥</span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">万元</span>
              </div>
            }
            onChange={bindChangeEvent('totalAssets')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.annualizedRate)}
            type="number"
            label="年化利率"
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">%</span>
              </div>
            }
            onChange={bindChangeEvent('annualizedRate')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.income)}
            type="number"
            label="年收入（税后）"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">￥</span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">万元</span>
              </div>
            }
            onChange={bindChangeEvent('income')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.workingYears)}
            type="number"
            label="工作至"
            labelPlacement="outside-left"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">第</span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">年</span>
              </div>
            }
            onChange={bindChangeEvent('workingYears')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.incomeIncreaseRate)}
            type="number"
            label="年收入增长速率"
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">%</span>
              </div>
            }
            onChange={bindChangeEvent('incomeIncreaseRate')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.maximumIncome)}
            type="number"
            label="年收入最高增长至"
            labelPlacement="outside-left"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">￥</span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">万元</span>
              </div>
            }
            onChange={bindChangeEvent('maximumIncome')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.minimumIncome)}
            type="number"
            label="最低限度年收入（税后）"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">￥</span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">万元</span>
              </div>
            }
            onChange={bindChangeEvent('minimumIncome')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.expense)}
            type="number"
            label="年支出"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">￥</span>
              </div>
            }
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">万元</span>
              </div>
            }
            onChange={bindChangeEvent('expense')}
          />
        </div>

        <div className={style.row}>
          <Input
            value={String(configuration.inflationRate)}
            type="number"
            label="通胀率"
            endContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small whitespace-nowrap">%</span>
              </div>
            }
            onChange={bindChangeEvent('inflationRate')}
          />
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
