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
    totalAssets: 50,
    annualizedRate: 3,
    income: 30,
    incomeIncreaseRate: 8,
    expense: 10,
    inflationRate: 4,
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

    const numberOfYears = 30;
    const needStopWorking = true;
    const minimumIncome = 5;

    Array.from({ length: numberOfYears }).forEach(() => {
      const { annualizedRate, incomeIncreaseRate, inflationRate } = configuration;
      const { totalAssets, passiveIncome, income, expense } = _.mapValues(
        Datasets,
        dataset => _.last(dataset) as number
      );

      Datasets.totalAssets.push(
        totalAssets + (totalAssets * annualizedRate) / 100 + income - expense
      );
      Datasets.passiveIncome.push(totalAssets * (annualizedRate / 100));
      Datasets.expense.push(expense * (1 + inflationRate / 100));

      if (passiveIncome > expense && needStopWorking) {
        Datasets.income.push(minimumIncome);
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
        },
        {
          label: '年收入',
          data: Datasets.income,
        },
        {
          label: '被动收入',
          data: Datasets.passiveIncome,
        },
        {
          label: '支出',
          data: Datasets.expense,
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
            value={String(configuration.totalAssets)}
            type="number"
            label="现有存款"
            placeholder="0.00"
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
            placeholder="0.00"
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
            placeholder="0.00"
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
            value={String(configuration.incomeIncreaseRate)}
            type="number"
            label="年均收入增长速率"
            placeholder="0.00"
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
            value={String(configuration.expense)}
            type="number"
            label="年支出"
            placeholder="0.00"
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
            placeholder="0.00"
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
