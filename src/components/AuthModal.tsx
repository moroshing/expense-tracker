import { useState } from "react";
import { Form, Input, Button, Divider, Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

export default function AuthModal() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, googleLogin } = useAuth();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      if (isRegistering) {
        await register(values.email, values.password);
        alert("Registration successful! You can now log in.");
        setIsRegistering(false);
      } else {
        await login(values.email, values.password);
      }
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please try logging in.");
      } else {
        alert("Failed: " + error.message || error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error) {
      alert("Failed to login with Google: " + error);
    }
  };

  return (
    <div className="auth-modal-container">
      <Typography.Text
        style={{
          display: "block",
          textAlign: "center",
          color: "#1677ff",
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: 1,
          marginTop: 10,
        }}
      >
        FINIFY.IO
      </Typography.Text>

      <Typography.Title
        level={4}
        style={{ textAlign: "center", marginBottom: 8, marginTop: 0 }}
      >
        {isRegistering ? "REGISTER" : "SIGN IN"}
      </Typography.Title>

      <Typography.Paragraph style={{ textAlign: "center", marginBottom: 15 }}>
        {isRegistering
          ? "Start tracking your finances today."
          : "Track your income and expenses seamlessly"}
      </Typography.Paragraph>

      <Form layout="vertical" onFinish={handleSubmit} size="small">
        <Form.Item
          label="Email Address"
          name="email"
          rules={[{ required: true, message: "Please input your email!" }]}
        >
          <Input type="email" autoFocus />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button
            style={{ marginTop: 15 }}
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="middle"
          >
            {isRegistering ? "REGISTER" : "LOGIN"}
          </Button>
        </Form.Item>
      </Form>

      <Divider plain style={{ margin: "12px 0" }}>
        or
      </Divider>

      <Button
        icon={<GoogleOutlined />}
        block
        onClick={handleGoogleLogin}
        size="middle"
      >
        Continue with Google
      </Button>

      <Typography.Paragraph
        style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}
      >
        {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
        <Button
          type="link"
          onClick={() => setIsRegistering(!isRegistering)}
          size="small"
          style={{ padding: 0 }}
        >
          {isRegistering ? "Login" : "Register"}
        </Button>
      </Typography.Paragraph>
    </div>
  );
}
