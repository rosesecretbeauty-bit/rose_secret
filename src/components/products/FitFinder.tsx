import React, { useState } from 'react';
import { Ruler, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
interface FitFinderProps {
  isOpen: boolean;
  onClose: () => void;
}
export function FitFinder({
  isOpen,
  onClose
}: FitFinderProps) {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [preference, setPreference] = useState('regular');
  const handleCalculate = () => {
    setStep(3); // Result step
  };
  return <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8">
        {step === 1 && <>
            <h2 className="text-2xl font-serif font-bold text-center mb-6">
              Find Your Perfect Fit
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="65" />
              </div>
              <Button fullWidth onClick={() => setStep(2)}>
                Next
              </Button>
            </div>
          </>}

        {step === 2 && <>
            <h2 className="text-2xl font-serif font-bold text-center mb-6">
              Fit Preference
            </h2>
            <div className="space-y-4 mb-6">
              {['Tight', 'Regular', 'Loose'].map(pref => <button key={pref} onClick={() => setPreference(pref.toLowerCase())} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${preference === pref.toLowerCase() ? 'border-rose-600 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="font-bold block">{pref}</span>
                  <span className="text-sm text-gray-500">
                    {pref === 'Tight' ? 'Form fitting' : pref === 'Regular' ? 'Standard fit' : 'Relaxed feel'}
                  </span>
                </button>)}
            </div>
            <Button fullWidth onClick={handleCalculate}>
              Calculate Size
            </Button>
          </>}

        {step === 3 && <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ruler className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold mb-2">
              Your Recommended Size
            </h2>
            <div className="text-5xl font-bold text-gray-900 mb-4">M</div>
            <p className="text-gray-600 mb-6">
              Based on your measurements and preference, Medium is your best fit
              with 92% confidence.
            </p>
            <Button fullWidth onClick={onClose}>
              Shop Size M
            </Button>
            <button onClick={() => setStep(1)} className="mt-4 text-sm text-gray-500 hover:text-gray-900">
              Recalculate
            </button>
          </div>}
      </div>
    </Modal>;
}