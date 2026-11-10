import { useLayoutEffect } from 'react';
import { useLanguage } from '@/i18n/context';

export type PaddleCheckoutFrameProps = {
  /** Set only after the controller receives checkout.loaded. */
  ready: boolean;
  /** Pass the stable callback from useCheckoutSession. */
  registerFrameTarget: (className: string | null) => void;
};

const FRAME_TARGET = 'paddle-checkout-frame';

/** Owns the target element only. Paddle owns every child it inserts. */
export default function PaddleCheckoutFrame({ ready, registerFrameTarget }: PaddleCheckoutFrameProps) {
  const { t } = useLanguage();

  useLayoutEffect(() => {
    registerFrameTarget(FRAME_TARGET);
    return () => registerFrameTarget(null);
  }, [registerFrameTarget]);

  return (
    <div dir="ltr" aria-busy={!ready} className="relative min-h-[450px] min-w-[312px] w-full overflow-visible">
      {!ready && (
        <div role="status" className="absolute inset-x-0 top-0 space-y-4">
          <div aria-hidden="true" className="space-y-4">
            <div className="flow-skeleton h-5 w-3/5" />
            <div className="flow-skeleton h-12 w-full" />
            <div className="flow-skeleton h-12 w-full" />
            <div className="flex gap-4">
              <div className="flow-skeleton h-12 flex-1" />
              <div className="flow-skeleton h-12 flex-1" />
            </div>
            <div className="flow-skeleton h-12 w-full" />
          </div>
          <p dir="auto" className="flow-fine">{t('Loading the secure card form')}</p>
        </div>
      )}
      <div aria-hidden={!ready} inert={!ready} className={ready ? 'flow-frame-ready' : 'invisible opacity-0'}>
        <div className={FRAME_TARGET} style={{ minHeight: 450, minWidth: 312, width: '100%', overflow: 'visible' }} />
      </div>
    </div>
  );
}
