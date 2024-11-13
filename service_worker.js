const filter = {
  url: [{ urlMatches: "https://focussflow.vercel.app/*" }],
};

chrome.webNavigation.onCompleted.addListener(async () => {
  let [tab] = await chrome.tabs.query({ active: true });
  const link = tab.url;
  const url = new URL(link);

  const urlParams = new URLSearchParams(url.search);

  const code = urlParams.get("code");

  if (code) {
    try {
      const response = await fetch(
        `https://focussflow.vercel.app/api/v1/login/${code}`,
        {
          method: "POST",
        }
      );
      const data = await response.json();

      let token = data.access_token;
      let pageId = data.page_id;
      let userId = data.user_id;

      // Correctly set the data in Chrome storage
      const clearStorage = () => {
        return new Promise((resolve) => {
          chrome.storage.local.clear(() => {
            console.log("Storage cleared.");
            resolve();
          });
        });
      };

      const setToken = (token) => {
        return new Promise((resolve) => {
          chrome.storage.local.set({ notionToken: token }, () => {
            console.log("Token is: " + token);
            resolve();
          });
        });
      };

      const setPageId = (pageId) => {
        return new Promise((resolve) => {
          chrome.storage.local.set({ notionPageId: pageId }, () => {
            console.log("Page ID is: " + pageId);
            resolve();
          });
        });
      };

      const setUserId = (userId) => {
        return new Promise((resolve) => {
          chrome.storage.local.set({ notionUserId: userId }, () => {
            console.log("User ID is: " + userId);
            resolve();
          });
        });
      };

      // Async function to clear storage and then set new data
      const storeData = async (token, pageId, userId) => {
        await clearStorage();
        await setToken(token);
        await setPageId(pageId);
        await setUserId(userId);
      };

      // Call the function with your data
      storeData(token, pageId, userId);

      const rs = await fetch(
        `https://api.notion.com/v1/blocks/${pageId}/children`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": "2022-06-28",
          },
        }
      );
      const dt = await rs.json();
      const todoList = dt.results
        .filter((block) => block.type === "to_do")
        .map((block) => block["to_do"]["rich_text"][0]["plain_text"]);

      // Store the array in Chrome local storage
      chrome.storage.local.set({ todoList }, () => {});
    } catch (error) {
      console.log(error);
    }
  }
});
