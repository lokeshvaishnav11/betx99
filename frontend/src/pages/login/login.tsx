// import React from "react";
// import User from "../../models/User";
// import { useAppDispatch, useAppSelector } from "../../redux/hooks";
// import { loginAction } from "../../redux/actions/login/login.action";
// import { selectUserData } from "../../redux/actions/login/loginSlice";
// import { useWebsocketUser } from "../../context/webSocketUser";
// import { useNavigateCustom } from "../_layout/elements/custom-link";
// import { isMobile } from "react-device-detect";
// import api from "../../utils/api";
// import SubmitButton from "../../components/SubmitButton";

// // const isMobile = true
// const Login = () => {
//   const dispatch = useAppDispatch();
//   const userState = useAppSelector(selectUserData);
//   const { socketUser } = useWebsocketUser();

//   const navigate = useNavigateCustom();

//   const [loginForm, setLoginForm] = React.useState<User>({
//     username: "",
//     password: "",
//     logs: "",
//     isDemo: false,
//   });

//   const [isDemoLogin, setIsDemoLogin] = React.useState(false); // Track Demo Login

//   React.useEffect(() => {
//     api.get(`${process.env.REACT_APP_IP_API_URL}`).then((res) => {
//       setLoginForm({ ...loginForm, logs: res.data });
//     });
//   }, []);

//   React.useEffect(() => {
//     if (userState.status === "done") {
//       const { role, _id } = userState.user;
//       socketUser.emit("login", {
//         role: userState.user.role,
//         sessionId: userState.user.sessionId,
//         _id,
//       });
//       localStorage.setItem("login-session", userState.user.sessionId);

//       if (
//         userState.user.role &&
//         ["admin", "1", "2", "3"].includes(userState.user.role)
//       ) {
//         return navigate.go("/");
//       }

//       return isMobile ? navigate.go("/") : navigate.go("/");
//     }
//   }, [userState]);

//   const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
//   };
//   const handleSubmitDemoLogin = () => {
//     const loginFormNew = { ...loginForm, isDemo: true };
//     setLoginForm(loginFormNew);
//     setIsDemoLogin(true);
//   };
//   const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     dispatch(loginAction(loginForm));
//     setIsDemoLogin(false);
//   };
//   return (
//     <div>
//       <div className="login">
//         <div className="loginInner1">
//           <div
//             className="featured-box-login featured-box-secundary default"
//             style={{
//               boxShadow: "0px 0px 30px rgb(0 0 0 / 82%)",
//               background: "transparent",
//             }}
//           >
//             <h4 className="text-center" style={{ color: "#11283E" }}>
//               <div className="log-logo m-b-20 text-center">
//                 <img src="/imgs/logo.png" className="logo-login" />
//               </div>
//             </h4>
//             <form
//               onSubmit={(e) => handleSubmit(e)}
//               role="form"
//               autoComplete="off"
//               method="post"
//             >
//               <div className="form-group m-b-20">
//                 <input
//                   name="username"
//                   placeholder="User Name"
//                   type="text"
//                   className="form-control"
//                   aria-required="true"
//                   aria-invalid="false"
//                   onChange={handleForm}
//                   required={!isDemoLogin}
//                 />
//                 <i className="fas fa-user text-dark"></i>
//                 <small
//                   className="text-danger"
//                   style={{ display: "none" }}
//                 ></small>
//               </div>
//               <div className="form-group m-b-20">
//                 <input
//                   name="password"
//                   placeholder="Password"
//                   type="password"
//                   className="form-control"
//                   aria-required="true"
//                   aria-invalid="false"
//                   onChange={handleForm}
//                   required={!isDemoLogin}
//                 />
//                 <i className="fas fa-key text-dark"></i>
//                 {userState.error ? (
//                   <small className="text-danger">{userState.error}</small>
//                 ) : (
//                   ""
//                 )}
//               </div>
//               <div className="form-group text-center mb-0">
//                 <SubmitButton
//                   type="submit"
//                   className="btn btn-submit btn-login mb-10"
//                   style={{ backgroundColor: "#11283E" }}
//                 >
//                   Login
//                   {userState.status === "loading" ? (
//                     <i className="ml-2 fas fa-spinner fa-spin"></i>
//                   ) : (
//                     <i className="ml-2 fas fa-sign-in-alt"></i>
//                   )}
//                 </SubmitButton>
//                 <SubmitButton
//                   type="submit"
//                   onClick={() => handleSubmitDemoLogin()}
//                   className="btn btn-submit btn-login mb-10"
//                   style={{ backgroundColor: "#11283E" }}
//                 >
//                   Login with Demo ID
//                   {userState.status === "loading" ? (
//                     <i className="ml-2 fas fa-spinner fa-spin"></i>
//                   ) : (
//                     <i className="ml-2 fas fa-sign-in-alt"></i>
//                   )}
//                 </SubmitButton>
//                 <small className="recaptchaTerms d-none">
//                   This site is protected by reCAPTCHA and the Google
//                   <a
//                     target={"_blank"}
//                     rel="noopener noreferrer"
//                     href="https://policies.google.com/privacy"
//                   >
//                     Privacy Policy
//                   </a>{" "}
//                   and
//                   <a
//                     target={"_blank"}
//                     rel="noopener noreferrer"
//                     href="https://policies.google.com/terms"
//                   >
//                     Terms of Service
//                   </a>{" "}
//                   apply.
//                 </small>
//               </div>
//               <div className="mt-2 text-center download-apk"></div>
//             </form>
//           </div>
//         </div>
//       </div>
//       <section className="footer footer-login">
//         <div className="footer-top">
//           <div className="footer-links d-none">
//             <nav className="navbar navbar-expand-sm">
//               <ul className="navbar-nav">
//                 <li className="nav-item">
//                   <a
//                     className="nav-link"
//                     href="/terms-and-conditions"
//                     target="_blank"
//                   >
//                     {" "}
//                     Terms and Conditions{" "}
//                   </a>
//                 </li>
//                 <li className="nav-item">
//                   <a
//                     className="nav-link"
//                     href="/responsible-gaming"
//                     target="_blank"
//                   >
//                     {" "}
//                     Responsible Gaming{" "}
//                   </a>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//           <div className="support-detail">
//             <h2>Note : This site is not for Indian Territory</h2>
//             <p></p>
//           </div>
//           <div className="social-icons-box"></div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Login;


// import React from "react";
// import User from "../../models/User";
// import { useAppDispatch, useAppSelector } from "../../redux/hooks";
// import { loginAction } from "../../redux/actions/login/login.action";
// import { selectUserData } from "../../redux/actions/login/loginSlice";
// import { useWebsocketUser } from "../../context/webSocketUser";
// import { useNavigateCustom } from "../_layout/elements/custom-link";
// import { isMobile } from "react-device-detect";
// import api from "../../utils/api";
// import SubmitButton from "../../components/SubmitButton";

// const Login = () => {
//   const dispatch = useAppDispatch();
//   const userState = useAppSelector(selectUserData);
//   const { socketUser } = useWebsocketUser();
//   const navigate = useNavigateCustom();

//   const [loginForm, setLoginForm] = React.useState<User>({
//     username: "",
//     password: "",
//     logs: "",
//     isDemo: false,
//   });

//   const [isDemoLogin, setIsDemoLogin] = React.useState(false);
//   const [showPassword, setShowPassword] = React.useState(false); // 👁 eye toggle

//   React.useEffect(() => {
//     api.get(`${process.env.REACT_APP_IP_API_URL}`).then((res) => {
//       setLoginForm((prev) => ({ ...prev, logs: res.data }));
//     });
//   }, []);

//   React.useEffect(() => {
//     if (userState.status === "done") {
//       const { _id, role, sessionId } = userState.user;

//       socketUser.emit("login", {
//         role,
//         sessionId,
//         _id,
//       });

//       localStorage.setItem("login-session", sessionId);
//       navigate.go("/");
//     }
//   }, [userState]);

//   const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
//   };

//   const handleSubmitDemoLogin = () => {
//     setLoginForm({ ...loginForm, isDemo: true });
//     setIsDemoLogin(true);
//   };

//   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     dispatch(loginAction(loginForm));
//     setIsDemoLogin(false);
//   };

//   return (
//     <div>
//       <div className="login">
//         <div className="loginInner1">
//           <div
//             className="featured-box-login featured-box-secundary default"
//             style={{
//               boxShadow: "0px 0px 30px rgb(0 0 0 / 82%)",
//               background: "transparent",
//             }}
//           >
//             <div className="log-logo m-b-20 text-center">
//               <img src="/imgs/logo.png" className="logo-login" />
//             </div>

//             <form onSubmit={handleSubmit} autoComplete="off">
//               {/* USERNAME */}
//               <div className="form-group m-b-20">
//                 <input
//                   name="username"
//                   placeholder="User Name"
//                   type="text"
//                   className="form-control"
//                   onChange={handleForm}
//                   required={!isDemoLogin}
//                 />
//                 <i className="fas fa-user text-dark"></i>
//               </div>

//               {/* PASSWORD */}
//               <div className="form-group m-b-20 position-relative">
//                 <input
//                   name="password"
//                   placeholder="Password"
//                   type={showPassword ? "text" : "password"}
//                   className="form-control"
//                   onChange={handleForm}
//                   required={!isDemoLogin}
//                 />

//                 <i className="fas fa-key text-dark"></i>

//                 {/* 👁 Eye Icon */}
//                 <i
//                   className={`fas ${
//                     showPassword ? "fa-eye-slash" : "fa-eye"
//                   }`}
//                   onClick={() => setShowPassword(!showPassword)}
//                   style={{
//                     position: "absolute",
//                     right: "15px",
//                     top: "50%",
//                     transform: "translateY(-50%)",
//                     cursor: "pointer",
//                     color: "#333",
//                   }}
//                 ></i>

//                 {userState.error && (
//                   <small className="text-danger">{userState.error}</small>
//                 )}
//               </div>

//               {/* BUTTONS */}
//               <div className="form-group text-center mb-0">
//                 <SubmitButton
//                   type="submit"
//                   className="btn btn-submit btn-login mb-10"
//                   style={{ backgroundColor: "#11283E" }}
//                 >
//                   Login
//                   {userState.status === "loading" ? (
//                     <i className="ml-2 fas fa-spinner fa-spin"></i>
//                   ) : (
//                     <i className="ml-2 fas fa-sign-in-alt"></i>
//                   )}
//                 </SubmitButton>

//                 <SubmitButton
//                   type="submit"
//                   onClick={handleSubmitDemoLogin}
//                   className="btn btn-submit btn-login mb-10"
//                   style={{ backgroundColor: "#11283E" }}
//                 >
//                   Login with Demo ID
//                   {userState.status === "loading" ? (
//                     <i className="ml-2 fas fa-spinner fa-spin"></i>
//                   ) : (
//                     <i className="ml-2 fas fa-sign-in-alt"></i>
//                   )}
//                 </SubmitButton>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>

//       <section className="footer footer-login">
//         <div className="footer-top">
//           <div className="support-detail">
//             <h2>Note : This site is not for Indian Territory</h2>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Login;



import React, { useEffect, useRef, useState } from "react";
import User from "../../models/User";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { loginAction } from "../../redux/actions/login/login.action";
import { selectUserData } from "../../redux/actions/login/loginSlice";
import { useWebsocketUser } from "../../context/webSocketUser";
import { useNavigateCustom } from "../_layout/elements/custom-link";
import api from "../../utils/api";
import "./login.css";

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const userState = useAppSelector(selectUserData);
  const { socketUser } = useWebsocketUser();
  const navigate = useNavigateCustom();

  const [loginForm, setLoginForm] = useState<User>({
    username: "",
    password: "",
    logs: "",
    isDemo: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handledSession = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    api
      .get(`${process.env.REACT_APP_IP_API_URL}`)
      .then((res) => {
        if (active) {
          setLoginForm((prev) => ({
            ...prev,
            logs: res.data,
          }));
        }
      })
      // .catch((error) => {
      //   console.error("IP API error:", error);
      // });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (userState.status !== "done" || !userState.user) {
      return;
    }

    const { _id, role, sessionId } = userState.user;

    if (!sessionId || handledSession.current === sessionId) {
      return;
    }

    handledSession.current = sessionId;

    socketUser.emit("login", {
      role,
      sessionId,
      _id,
    });

    localStorage.setItem("login-session", sessionId);

    setSubmitting(false);
    setLoginSuccess(true);

    redirectTimer.current = setTimeout(() => {
      navigate.go("/match/4");
    }, 900);
  }, [userState, socketUser, navigate]);

  useEffect(() => {
    if (userState.status === "error") {
      setSubmitting(false);
      setLoginSuccess(false);
    }
  }, [userState.status]);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const handleForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (submitting || userState.status === "loading") {
      return;
    }

    setLoginSuccess(false);
    setSubmitting(true);

    dispatch(
      loginAction({
        ...loginForm,
        isDemo: false,
      })
    );
  };

  const isLoading = submitting || userState.status === "loading";

  return (
    <div className="bh-login-page">
      <div className="bh-hero" />

      <main className="bh-card">
        <div className="bh-badge">
          <div className="bh-badge-inner">
            <img
              src="/imgs/logobet2.png"
              alt="BETHUB 24 PRO"
              className="logo-login"
            />
          </div>
        </div>

        <h1 className="bh-title">LOGIN</h1>

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="bh-form"
        >
          <div className="bh-input-wrap">
            <input
              name="username"
              placeholder="Username"
              type="text"
              className="bh-input"
              value={loginForm.username}
              onChange={handleForm}
              autoComplete="username"
              required
            />
          </div>

          <div className="bh-input-wrap">
            <input
              name="password"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              className="bh-input"
              value={loginForm.password}
              onChange={handleForm}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="bh-eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <i
                className={`fas ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                }`}
              />
            </button>
          </div>

          {userState.error && !loginSuccess && (
            <div className="bh-error" role="alert">
              {userState.error}
            </div>
          )}

          <div className="bh-btn-group">
            <button
              type="submit"
              className="bh-btn-login"
              disabled={isLoading || loginSuccess}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                "Login"
              )}
            </button>

            {loginSuccess && (
              <div
                className="bh-success-popup"
                role="status"
                aria-live="polite"
              >
                <span className="bh-success-icon">✓</span>
                <span>Login Successful!</span>
              </div>
            )}
          </div>
        </form>
      </main>

      <footer className="bh-footer">
        <div className="bh-powered">
          <span>Powered By</span>
          <img
            src="	https://bethub24pro.com/assets/images/betfair.png"
            alt="Betfair"
          />
        </div>
      </footer>
    </div>
  );
};

export default Login;
