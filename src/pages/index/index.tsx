import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, AccordionItem, Input, ScrollShadow } from '@nextui-org/react';
import { Chart, registerables } from 'chart.js';
import _ from 'lodash';
import { ChartHelper } from './chart';
import { Configuration } from './interfaces';

import style from './index.module.less';

Chart.register(...registerables);

const IndexPage: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chart = useMemo(() => new ChartHelper(), []);

  const [configuration, setConfiguration] = useState<Configuration>({
    numberOfYears: 40,
    totalAssets: 50,
    annualizedRate: 2.5,
    income: 30,
    incomeIncreaseRate: 8,
    expense: 6,
    inflationRate: 4,
    maximumIncome: 40,
    minimumIncomeIncreaseRate: 4,
    minimumIncome: 5,
    workingYears: 10,
  });

  useEffect(() => {
    canvasRef.current && chart.init(canvasRef.current);

    const cachedConfigurationJson = localStorage.getItem('configuration');

    const cachedConfiguration = cachedConfigurationJson
      ? JSON.parse(cachedConfigurationJson)
      : null;

    if (cachedConfiguration) {
      setConfiguration(cachedConfiguration);
    }
  }, []);

  useEffect(() => {
    chart.render(configuration);
  }, [configuration]);

  const bindChangeEvent = (field: string) => {
    return <T extends HTMLInputElement>(e: React.ChangeEvent<T>) => {
      const value = _.toNumber(e.target.value);

      setConfiguration(configuration => {
        const newConfiguration = { ...configuration, [field]: value };

        localStorage.setItem('configuration', JSON.stringify(newConfiguration));
        return newConfiguration;
      });
    };
  };

  return (
    <div className={style.container}>
      <div className={style.preview}>
        <canvas ref={canvasRef}></canvas>
      </div>

      <div className={style.configuration}>
        <ScrollShadow className={style.scroll} hideScrollBar>
          <Accordion className={style.accordion} selectionMode="multiple" defaultSelectedKeys="all">
            <AccordionItem key="1" title="基本">
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
                  classNames={{
                    input: ['flex-auto'],
                  }}
                  value={String(configuration.workingYears)}
                  type="number"
                  label="工作至"
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
            </AccordionItem>

            <AccordionItem key="2" title="收入（税后）">
              <div className={style.row}>
                <Input
                  value={String(configuration.income)}
                  type="number"
                  label="年收入"
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
                  label="躺平后年收入"
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
                  value={String(configuration.minimumIncomeIncreaseRate)}
                  type="number"
                  label="躺平后年收入增长速率"
                  endContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-default-400 text-small whitespace-nowrap">%</span>
                    </div>
                  }
                  onChange={bindChangeEvent('minimumIncomeIncreaseRate')}
                />
              </div>
            </AccordionItem>

            <AccordionItem key="3" title="支出">
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
            </AccordionItem>
          </Accordion>
        </ScrollShadow>
      </div>
    </div>
  );
};

export default IndexPage;
