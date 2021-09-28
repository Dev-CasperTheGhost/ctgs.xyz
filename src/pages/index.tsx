import * as React from "react";
import Head from "next/head";
import { Formik } from "formik";
import { Moon, Sun } from "react-bootstrap-icons";

import { validate } from "lib/validate";

import { getThemeFromLocal, Theme, updateBodyClass, updateLocalTheme } from "lib/theme";
import { FormField } from "components/FormField";
import { Error } from "components/Error";
import { Input } from "components/Input";
import { useRouter } from "next/dist/client/router";
import { handleCopy } from "lib/utils";
import { Loader } from "components/Loader";

const INITIAL_VALUES = {
  url: "",
  slug: "",
};

export default function Home() {
  const router = useRouter();
  const [result, setResult] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<null | string>(null);
  const [theme, setTheme] = React.useState<Theme>("dark");

  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    ref.current?.focus();
  }, []);

  React.useEffect(() => {
    const t = getThemeFromLocal();

    setTheme(t);
    updateLocalTheme(t);
    updateBodyClass(t);
  }, []);

  function handleThemeChange() {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    updateLocalTheme(newTheme);
  }

  async function onSubmit(data: typeof INITIAL_VALUES) {
    setResult(null);
    setError(null);

    try {
      setLoading(true);
      const res = await fetch("/api/new", {
        method: "POST",
        body: JSON.stringify(data),
        credentials: "omit",
      });

      const json: Record<string, string> | string = await (res.ok ? res.json() : res.text());

      if (typeof json === "string") {
        console.log(json);
        setError(json);
      } else if (typeof json === "object") {
        const url = `https://ctgs.xyz/${json.slug}`;
        setResult(url);
      }

      setLoading(false);
    } catch (e: any) {
      console.log(e);

      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 text-black dark:text-gray-300 h-screen flex items-center justify-center w-screen">
      <Head>
        <title>ctgs.xyz</title>

        <meta name="twitter:title" content="ctgs.xyz" />
        <meta property="og:site_name" content="ctgs.xyz" />
        <meta property="og:title" content="ctgs.xyz" />

        <meta name="description" content="Create a shortened URL." />
        <meta property="og:description" content="Create a shortened URL." />
        <meta name="twitter:description" content="Create a shortened URL." />

        <link rel="canonical" href="https://ctgs.xyz" />
        <meta property="og:url" content="https://ctgs.xyz" />
      </Head>

      <div className="absolute top-5 left-5">
        <a
          rel="noopener noreferrer"
          target="_blank"
          href="https://github.com/Dev-CasperTheGhost/ctgs.xyz"
          className="py-2 px-3 bg-gray-600 dark:bg-gray-700 text-white rounded-md"
        >
          Source code
        </a>
      </div>

      <div className="absolute top-5 right-5">
        <button
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          onClick={handleThemeChange}
          className="p-2"
        >
          {theme === "light" ? (
            <Moon className="fill-current text-gray-700 " width="20px" height="20px" />
          ) : (
            <Sun className="fill-current text-white" width="20px" height="20px" />
          )}
        </button>
      </div>

      <div className="w-screen px-10 md:w-9/12 xl:w-3/6 xl:px-0">
        {router.query.fromGa ? (
          <div className="text-lg bg-gray-300 dark:bg-gray-700 my-5 rounded-md p-2 px-3">
            <span className="font-semibold">ctgs.ga</span> has moved to{" "}
            <span className="font-semibold">ctgs.xyz</span>!
          </div>
        ) : null}

        <h1 className="text-3xl mb-3 font-semibold">Create a shortened URL!</h1>

        <Formik validate={validate} onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
          {({ handleSubmit, handleChange, handleBlur, errors, touched, isValid }) => (
            <form onSubmit={handleSubmit}>
              {error ? (
                <div className="bg-red-500 text-white p-2 px-3 font-semibold rounded-md my-2">
                  {error}
                </div>
              ) : null}

              <FormField label="Enter URL">
                <Input
                  hasError={!!errors.url}
                  ref={ref}
                  type="url"
                  id="url"
                  placeholder="URL"
                  name="url"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Error touched={touched.url}>{errors.url}</Error>
              </FormField>

              <FormField label="Enter slug">
                <Input
                  hasError={!!errors.slug}
                  type="text"
                  id="slug"
                  placeholder="Slug"
                  name="slug"
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Error touched={touched.slug}>{errors.slug}</Error>
              </FormField>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">Shortened URL: </span>
                  {result ? (
                    <>
                      <a
                        className="hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={result}
                      >
                        {result}
                      </a>
                      <span
                        className="text-sm ml-2 text-white dark:text-gray-300 bg-gray-600 dark:bg-gray-700 p-0.5 px-1 rounded cursor-pointer"
                        onClick={(e) => handleCopy(result, e)}
                      >
                        Copy
                      </span>
                    </>
                  ) : null}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading || !isValid}
                    className={`p-2 px-4 text-white rounded-md bg-gray-600 dark:bg-gray-700 dark:focus:ring-2 dark:focus:ring-white self-end transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                      loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                    }`}
                  >
                    {loading ? <Loader /> : "Create!"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}
