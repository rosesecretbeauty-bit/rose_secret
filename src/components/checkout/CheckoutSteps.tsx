import React from 'react';
import { Check } from 'lucide-react';
interface CheckoutStepsProps {
  currentStep: 'shipping' | 'payment' | 'review';
}
export function CheckoutSteps({
  currentStep
}: CheckoutStepsProps) {
  const steps = [{
    id: 'shipping',
    name: 'Envío'
  }, {
    id: 'payment',
    name: 'Pago'
  }, {
    id: 'review',
    name: 'Revisión'
  }];
  const getStepStatus = (stepId: string) => {
    if (stepId === currentStep) return 'current';
    const stepOrder = ['shipping', 'payment', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(stepId);
    return stepIndex < currentIndex ? 'complete' : 'upcoming';
  };
  return <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
        const status = getStepStatus(step.id);
        return <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''} relative`}>
              {status === 'complete' ? <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-rose-600" />
                  </div>
                  <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 hover:bg-rose-900">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </> : status === 'current' ? <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <a href="#" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-rose-600 bg-white" aria-current="step">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </> : <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-gray-200" />
                  </div>
                  <a href="#" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white hover:border-gray-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" aria-hidden="true" />
                    <span className="sr-only">{step.name}</span>
                  </a>
                </>}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium text-gray-500">
                {step.name}
              </div>
            </li>;
      })}
      </ol>
    </nav>;
}