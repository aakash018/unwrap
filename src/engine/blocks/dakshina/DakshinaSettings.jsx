// Toolbar controls for Dakshina: envelope text, blessing, amount and wallet.
import Field from '../../components/shared/Field';
import TextInput from '../../components/shared/TextInput';

const WALLETS = ['eSewa', 'Khalti'];

export default function DakshinaSettings({ props, onChange }) {
  return (
    <>
      <Field label="On the envelope">
        <TextInput value={props.label} onChange={(label) => onChange({ label })} />
      </Field>
      <Field label="From">
        <TextInput value={props.from} onChange={(from) => onChange({ from })} />
      </Field>
      <Field label="Blessing inside">
        <TextInput value={props.greeting} onChange={(greeting) => onChange({ greeting })} />
      </Field>
      <Field label="Amount">
        <TextInput value={props.amount} onChange={(amount) => onChange({ amount })} />
      </Field>
      <Field label="Wallet">
        <div className="flex divide-x divide-line overflow-hidden rounded-lg border border-line">
          {WALLETS.map((wallet) => (
            <button
              key={wallet}
              className={`flex-1 py-1.5 text-xs ${
                props.wallet === wallet ? 'bg-ink text-white' : 'bg-white hover:bg-stone-50'
              }`}
              onClick={() => onChange({ wallet })}
            >
              {wallet}
            </button>
          ))}
        </div>
      </Field>
      <p className="text-xs leading-relaxed text-ink-soft">
        Payments aren't connected yet — the button is a preview.
      </p>
    </>
  );
}
