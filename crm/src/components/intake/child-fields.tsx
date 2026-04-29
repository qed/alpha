"use client";

interface ChildEntry {
  first_name: string;
  grade: string;
  age: string;
  gender: string;
}

interface ChildFieldsProps {
  entries: ChildEntry[];
  onChange: (entries: ChildEntry[]) => void;
}

const EMPTY_CHILD: ChildEntry = {
  first_name: "",
  grade: "",
  age: "",
  gender: "",
};

export function ChildFields({ entries, onChange }: ChildFieldsProps) {
  const addChild = () => {
    if (entries.length >= 15) return;
    onChange([...entries, { ...EMPTY_CHILD }]);
  };

  const removeChild = (index: number) => {
    if (entries.length <= 1) return;
    onChange(entries.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof ChildEntry, value: string) => {
    const updated = entries.map((c, i) =>
      i === index ? { ...c, [field]: value } : c
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-ink">Children</label>
        {entries.length < 15 && (
          <button
            type="button"
            onClick={addChild}
            className="text-sm text-alpha-blue hover:text-alpha-blue-600 font-medium"
          >
            + Add child
          </button>
        )}
      </div>

      {entries.map((child, index) => (
        <div
          key={index}
          className="grid grid-cols-2 gap-3 p-4 bg-paper-2 rounded-md border border-line"
        >
          <div className="col-span-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider">
              Child {index + 1}
            </span>
            {entries.length > 1 && (
              <button
                type="button"
                onClick={() => removeChild(index)}
                className="text-xs text-danger hover:text-danger/80"
              >
                Remove
              </button>
            )}
          </div>
          <input
            type="text"
            placeholder="First name *"
            value={child.first_name}
            onChange={(e) => updateChild(index, "first_name", e.target.value)}
            required
            maxLength={100}
            className="col-span-2 sm:col-span-1 px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
          />
          <select
            value={child.grade}
            onChange={(e) => updateChild(index, "grade", e.target.value)}
            className="px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
          >
            <option value="">Grade</option>
            <option value="Pre-K">Pre-K</option>
            <option value="K">Kindergarten</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={`${i + 1}`}>
                Grade {i + 1}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Age"
            value={child.age}
            onChange={(e) => updateChild(index, "age", e.target.value)}
            min={2}
            max={19}
            className="px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
          />
          <select
            value={child.gender}
            onChange={(e) => updateChild(index, "gender", e.target.value)}
            className="px-3 py-2 border border-line rounded-sm text-sm focus:outline-none focus:border-alpha-blue"
          >
            <option value="">Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
      ))}
    </div>
  );
}
