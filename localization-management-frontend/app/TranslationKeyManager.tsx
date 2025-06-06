"use client";

import { useEffect } from "react";
import { create } from 'zustand'

const PROJECT_ID = 'take_home_assignment';
const LOCALE = 'en_US';
const URL = `http://127.0.0.1:8000/localizations/${PROJECT_ID}/${LOCALE}`;

type Localizations = {
  [key: string]: string
};
type State = {
  localizations: Localizations;
  updating: boolean;
}
type Action = {
  setLocalizations: (newLocalizations: Localizations) => void;
  setUpdating: (newUpdating: boolean) => void;
}
const useStore = create<State & Action>((set) => ({
  localizations: {},
  updating: false,
  setLocalizations: (newLocalizations) => set({ localizations: newLocalizations }),
  setUpdating: (newUpdating) => set({ updating: newUpdating })
}));

export default function TranslationKeyManager() {
  const { localizations, updating, setLocalizations, setUpdating } = useStore((state) => state);

  useEffect(() => {
    (async () => {
      if (Object.keys(localizations).length > 0) {
        return;
      }
      const resp = await fetch(URL);
      const json = await resp.json();
      console.log(json);
      setLocalizations(json.localizations);
    })();
  });

  const updateKey = (i: number, oldKey: string, newKey: string, value: string) => {
    const newLocalizations = Object.entries(localizations).reduce((acc, curr, idx) => {
      if (i === idx) {
        acc[newKey] = value;
      } else {
        acc[curr[0]] = curr[1];
      }
      return acc;
    }, {} as Localizations);
    setLocalizations(newLocalizations);
  };

  const updateValue = (i: number, key: string, newValue: string) => {
    const newLocalizations = Object.entries(localizations).reduce((acc, curr, idx) => {
      if (i === idx) {
        acc[key] = newValue;
      } else {
        acc[curr[0]] = curr[1];
      }
      return acc;
    }, {} as Localizations);
    setLocalizations(newLocalizations);
  };

  const updateDatabaseKey = async (oldKey: string, newKey: string) => {
    setUpdating(true);
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'key',
        value: newKey
      })
    };
    await fetch(`${URL}/${oldKey}`, requestOptions);
    setUpdating(false);
  };

  const updateDatabaseValue = async (key: string, newValue: string) => {
    setUpdating(true);
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'value',
        value: newValue
      })
    };
    await fetch(`${URL}/${key}`, requestOptions);
    setUpdating(false);
  };

  return (
    <div className="w-96">
      <div className="my-8" />
      <table>
        <thead>
          <tr>
            <td>Key</td>
            <td>Value</td>
          </tr>
        </thead>
        <tbody>
          {Object.entries(localizations).map(([key, value], i) => {
            return (
              <tr key={i}>
                  <td width="200">
                    <input
                      type="text"
                      disabled={updating}
                      value={key}
                      onChange={(e) => updateKey(i, key, e.target.value, value)}
                      onBlur={(e) => updateDatabaseKey(key, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      disabled={updating}
                      value={value}
                      onChange={(e) => updateValue(i, key, e.target.value)}
                      onBlur={(e) => updateDatabaseValue(key, e.target.value)}
                    />
                  </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
