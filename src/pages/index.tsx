import * as React from "react";
import Head from "next/head";
import { Formik } from "formik";
import { Moon, Sun } from "react-bootstrap-icons";

import { validate } from "lib/validate";

import { getThemeFromLocal, Theme, updateBodyClass, updateLocalTheme } from "lib/theme";
import { FormField } from "components/FormField";
import { Error } from "components/Error";
import { Input } from "components/Input";

const INITIAL_VALUES = {
  url: "",
  slug: "",
};

export default function Home() {
  const [result, setResult] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const ref = React.useRef<HTMLInputElement>(null);

  const [theme, setTheme] = React.useState<Theme>("dark");

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

  function handleCopy(e: React.MouseEvent<HTMLSpanElement, MouseEvent>) {
    if (!result) return;
    const element = e.currentTarget;

    navigator.clipboard.writeText(result);
    element.innerText = "Copied!";

    setTimeout(() => {
      element.innerText = "Copy";
    }, 1_000);
  }

  async function onSubmit(data: typeof INITIAL_VALUES) {
    setResult(null);

    try {
      const res = await fetch("/api/new", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const json: Record<string, string> | string = await (res.ok ? res.json() : res.text());

      if (typeof json === "string") {
        console.log(json);
      } else if (typeof json === "object") {
        const url = `https://ctgs.xyz/${json.slug}`;
        setResult(url);
      }

      setLoading(false);
    } catch (e) {
      console.log(e);
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
        <h1 className="text-2xl mb-5">Create a shortened URL!</h1>

        <Formik validate={validate} onSubmit={onSubmit} initialValues={INITIAL_VALUES}>
          {({ handleSubmit, handleChange, handleBlur, errors, touched }) => (
            <form onSubmit={handleSubmit}>
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
                        onClick={handleCopy}
                      >
                        Copy
                      </span>
                    </>
                  ) : null}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`p-2 px-4 text-white rounded-md bg-gray-600 dark:bg-gray-700 dark:focus:ring-2 dark:focus:ring-white self-end transition-all ${
                      loading ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                    }`}
                  >
                    {loading ? "loading..." : "Create!"}
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
