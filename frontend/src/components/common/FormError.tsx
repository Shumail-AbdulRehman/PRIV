
interface FormErrorProps {
  message: string | null;
}

const FormError= ({ message }:FormErrorProps) => {
  if (!message) return null;

  return <div className="text-red-600 w-full h-auto">{message}</div>;
};

export default FormError;