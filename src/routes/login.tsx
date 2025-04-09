import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (isLoading || email === "" || password === "") return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (provider: GoogleAuthProvider | GithubAuthProvider) => {
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-8">로그인</h1>
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
        <input
          name="email"
          type="email"
          placeholder="이메일"
          value={email}
          onChange={onChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={onChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>
      
      <div className="mt-4 space-y-2 w-full max-w-md">
        <button
          onClick={() => socialLogin(new GoogleAuthProvider())}
          className="w-full flex items-center justify-center gap-2 bg-white border py-2 rounded-lg hover:bg-gray-50"
        >
          <FaGoogle /> Google로 로그인
        </button>
        <button
          onClick={() => socialLogin(new GithubAuthProvider())}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900"
        >
          <FaGithub /> Github로 로그인
        </button>
      </div>

      {error !== "" && <p className="text-red-500 mt-4">{error}</p>}
      
      <p className="mt-4">
        계정이 없으신가요?{" "}
        <Link to="/signup" className="text-blue-500 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
} 