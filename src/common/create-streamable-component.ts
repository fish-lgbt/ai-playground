import { createStreamableUI } from 'ai/rsc';
import { ReactNode } from 'react';

export const createStreamableComponent = (initial: ReactNode, generator: () => AsyncGenerator<ReactNode>) => {
  const ui = createStreamableUI(initial);

  // Loop over the generator above and call ui.update for each yield until we hit the return and then call ui.done
  void (async () => {
    const iterator = generator();
    let lastValue: IteratorYieldResult<ReactNode> | IteratorReturnResult<ReactNode> | undefined;
    while (!(lastValue = await iterator.next()).done) {
      ui.update(lastValue.value);
    }
    ui.done(lastValue.value);
  })();

  return ui.value;
};
