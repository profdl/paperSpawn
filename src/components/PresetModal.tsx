import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  existingNames?: string[];
  mode: 'save' | 'load';
  presets?: { id: string; name: string }[];
  onLoad?: (id: string) => void;
}

export default function PresetModal({ 
  isOpen, 
  onClose, 
  onSave, 
  existingNames = [], 
  mode,
  presets = [],
  onLoad
}: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'save') {
      if (!name.trim()) {
        setError('Please enter a preset name');
        return;
      }

      if (existingNames.includes(name)) {
        if (!confirm(`A preset named "${name}" already exists. Do you want to overwrite it?`)) {
          return;
        }
      }

      onSave(name);
      setName('');
      onClose();
    } else if (mode === 'load' && selectedPreset) {
      onLoad?.(selectedPreset);
      onClose();
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>

          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                {mode === 'save' ? 'Save Preset' : 'Load Preset'}
              </Dialog.Title>

              <form onSubmit={handleSubmit} className="mt-4">
                {error && (
                  <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded">
                    {error}
                  </div>
                )}

                {mode === 'save' ? (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Preset Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="preset" className="block text-sm font-medium text-gray-700">
                      Select Preset
                    </label>
                    <select
                      id="preset"
                      value={selectedPreset}
                      onChange={(e) => setSelectedPreset(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      required
                    >
                      <option value="">Select a preset...</option>
                      {presets.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {mode === 'save' ? 'Save' : 'Load'}
                  </button>
                </div>
              </form>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}