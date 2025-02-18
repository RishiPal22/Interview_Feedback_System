import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_API_KEY;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log("Google Generative AI instance created:", genAI);
} else {
  console.error("API_KEY is not defined in the environment variables");
} 

function Audiogooglegenai() {
  return (
    <div>helo</div>
  );
}

export default Audiogooglegenai;