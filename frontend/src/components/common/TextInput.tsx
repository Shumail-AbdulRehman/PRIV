
import type { UseFormRegisterReturn } from 'react-hook-form';

interface TextInputProps {
  label: string;
  register: UseFormRegisterReturn;
  type?: string;
  error?: string;
}

const TextInput = ({ label, register, type = 'text', error }: TextInputProps) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-semibold">{label}</label>
      <input
        type={type}
        {...register}
        className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default TextInput;