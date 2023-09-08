import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  ::-webkit-scrollbar {
    width: 10px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 5px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const CompBlock = styled.div`
  max-height: 100vh;
  overflow: hidden;
`;

const StickyHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: #282c34;
  padding: 10px 0;
  text-align: center;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000; // This ensures the header stays on top of other elements
  font-size: 24px;
`;
const FooterBar = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #282c34;
  padding: 10px 0;
  text-align: end;
  color: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000; // This ensures the footer stays on top of other elements
`;
const Container = styled.div`
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: auto;
`;

const TextArea = styled.textarea`
  width: 300px;
  height: 100px;
  margin: 10px 0;
  box-sizing: border-box;
  border: 1px solid #888;
  transition: border 0.3s;
  &:focus {
    border: 1px solid #555;
    outline: none;
  }
`;

const Button = styled.button`
  margin: 10px 5px;
  padding: 5px 15px;
  border: none;
  background-color: #555;
  color: white;
  border-radius: 5px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #888;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  border: 1px solid red;
  padding: 5px;
  margin-bottom: 10px;
`;

const PermissionButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 24px;
  background-color: rgba(255, 255, 255, 0.1);
  font-weight: bold;
  font-size: 16px;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); // Subtle shadow for depth

  &:hover {
    background-color: rgba(
      255,
      255,
      255,
      0.2
    ); // Slightly more prominent background on hover
    transform: scale(1.05); // Slight zoom effect on hover for interactivity
  }

  &:active {
    transform: scale(0.95); // Slight shrink effect when button is clicked
  }
`;

const DuplicateKeyIdFinder = () => {
  const [keyName, setKeyName] = useState("accountId");
  const [jsonInputs, setJsonInputs] = useState([""]);
  const [duplicates, setDuplicates] = useState([]);
  const [allKeys, setAllKeys] = useState([]);
  const [invalidJsonIndexes, setInvalidJsonIndexes] = useState([]);
  const [isAllKeysVisible, setAllKeysVisible] = useState(false);
  const [isDuplicatesVisible, setDuplicatesVisible] = useState(false);
  const [clipboardPermission, setClipboardPermission] = useState(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const headerHeight = headerRef.current?.clientHeight;
  const bodyHeight = headerHeight + footerRef.current?.clientHeight;

  useEffect(() => {
    async function checkPermission() {
      if (!navigator.permissions) {
        return;
      }
      const permissionStatus = await navigator.permissions.query({
        name: "clipboard-read",
      });
      setClipboardPermission(permissionStatus.state);

      permissionStatus.onchange = () => {
        setClipboardPermission(permissionStatus.state);
      };
    }

    checkPermission();
  }, []);
  useEffect(() => {
    const keyMap = {};
    const duplicatesList = [];
    const allKeysList = [];
    const invalidJsons = [];

    jsonInputs.forEach((json, index) => {
      try {
        const arr = JSON.parse(json);
        arr.forEach((obj) => {
          const key = obj[keyName];
          if (!allKeysList.includes(key)) {
            allKeysList.push(key);
          }
          if (keyMap[key]) {
            if (!duplicatesList.includes(key)) {
              duplicatesList.push(key);
            }
          } else {
            keyMap[key] = true;
          }
        });
      } catch (e) {
        invalidJsons.push(index);
      }
    });

    setInvalidJsonIndexes(invalidJsons);
    setAllKeys(allKeysList);
    setDuplicates(duplicatesList);
  }, [jsonInputs, keyName]);

  const showToast = (message, type = "success") => {
    if (type === "error") {
      toast(message, {
        position: "bottom-right",
        autoClose: 1000,
        closeOnClick: true,
        draggable: true,
        type: "error",
      });
    } else {
      toast.success(message);
    }
  };

  const copyToClipboard = (data) => {
    navigator.clipboard
      .writeText(JSON.stringify(data))
      .then(() => {
        showToast("Data copied to clipboard!");
      })
      .catch(() => {
        showToast("Failed to copy data to clipboard.", "error");
      });
  };

  const handleFocus = async (index) => {
    try {
      if (jsonInputs[index].trim() === "") {
        const clipboardText = await navigator.clipboard.readText();
        JSON.parse(clipboardText);
        const newJsonInputs = [...jsonInputs];
        newJsonInputs[index] = clipboardText;
        setJsonInputs(newJsonInputs);
      }
    } catch (err) {
      console.warn("Failed to read clipboard contents or invalid JSON: ", err);
    }
  };

  return (
    <CompBlock>
      <GlobalStyles />
      <StickyHeader ref={headerRef}>
        Duplicate JSON's Key Value Finder
      </StickyHeader>
      <Container
        style={{
          maxHeight: `calc(100vh - ${bodyHeight + 40}px)`,
          marginTop: headerHeight,
        }}
      >
        <div>
          <label>Key Name: </label>
          <input
            type="text"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            placeholder="Enter key name e.g. accountId"
          />
        </div>

        {keyName &&
          jsonInputs.map((jsonInput, index) => (
            <div key={index}>
              <TextArea
                value={jsonInput}
                onChange={(e) => {
                  const newJsonInputs = [...jsonInputs];
                  newJsonInputs[index] = e.target.value;
                  setJsonInputs(newJsonInputs);
                }}
                onFocus={() => handleFocus(index)}
                placeholder="Enter JSON here"
              />
              {invalidJsonIndexes.includes(index) && (
                <ErrorMessage>Invalid JSON</ErrorMessage>
              )}
            </div>
          ))}

        <Button
          onClick={() => {
            if (jsonInputs.some((input) => input.trim() === "")) {
              showToast(
                "Please fill in the blank textareas before adding another.",
                "error"
              );
            } else {
              setJsonInputs((prev) => [...prev, ""]);
            }
          }}
        >
          Add another input
        </Button>

        {duplicates.length > 0 && (
          <div>
            <Button onClick={() => setDuplicatesVisible(!isDuplicatesVisible)}>
              {isDuplicatesVisible
                ? "Hide Duplicate Keys"
                : "Show Duplicate Keys"}
            </Button>
            {isDuplicatesVisible && (
              <div>
                <h2>Duplicate Value of {keyName}:</h2>
                <ol>
                  {duplicates.map((id, idx) => (
                    <li key={idx}>{id}</li>
                  ))}
                </ol>
                <Button onClick={() => copyToClipboard(duplicates)}>
                  Copy Duplicate Values
                </Button>
              </div>
            )}
          </div>
        )}

        {allKeys.length > 0 && (
          <div>
            <Button onClick={() => setAllKeysVisible(!isAllKeysVisible)}>
              {isAllKeysVisible ? "Hide All Keys" : "Show All Keys"}
            </Button>
            {isAllKeysVisible && (
              <div>
                <h2>All Values of {keyName}:</h2>
                <ol>
                  {allKeys.map((id, idx) => (
                    <li key={idx}>{id}</li>
                  ))}
                </ol>
                <Button onClick={() => copyToClipboard(allKeys)}>
                  Copy All Values
                </Button>
              </div>
            )}
          </div>
        )}
      </Container>
      <FooterBar ref={footerRef}>
        {clipboardPermission === "denied" && (
          <p style={{ margin: 0, marginRight: 10 }}>
            Enable Clipboard Permission for fast progression
          </p>
        )}
      </FooterBar>
      <ToastContainer />
    </CompBlock>
  );
};

export default DuplicateKeyIdFinder;
