const modifyYouTubePage = async () => {
  let [tab] = await chrome.tabs.query({ active: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const recommendations = document.querySelectorAll("#related, #comments");
      recommendations.forEach((el) => (el.style.display = "none"));
    },
  });
};

const updateButtonText = async () => {
  const notionBtn = document.getElementById("notion");
  await chrome.storage.local.get("notionToken", (result) => {
    if (result.notionToken) {
      notionBtn.textContent = "Logout";
    } else {
      notionBtn.textContent = "Login to Notion";
    }
  });
};

const handleLoginLogout = async () => {
  let [tab] = await chrome.tabs.query({ active: true });
  const notionBtn = document.getElementById("notion");

  await chrome.storage.local.get("notionToken", async (result) => {
    if (result.notionToken) {
      await chrome.storage.local.remove("notionToken");
      await chrome.storage.local.remove("todoList");
      notionBtn.textContent = "Login to Notion";
    } else {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: async () => {
          const rs = await fetch(
            "https://focussflow.vercel.app/api/v1/clientid"
          );
          const data = await rs.json();
          const clientId = data.clientId;
          console.log(clientId);
          const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&response_type=code&owner=user`;
          window.location.href = authUrl;
        },
      });
    }
  });
};

const handleData = async () => {
  let [tab] = await chrome.tabs.query({ active: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      await chrome.storage.local.get(
        ["notionToken", "notionPageId", "notionUserId"],
        async (result) => {
          const notionToken = result.notionToken;
          const notionPageId = result.notionPageId;
          const notionUserId = result.notionUserId;

          if (!notionToken) {
            return;
          }

          chrome.storage.local.get(["todoList"], (result) => {
            const todos = result.todoList || [];

            const existingTodoList = document.getElementById("todoList");
            if (existingTodoList) {
              existingTodoList.remove();
            }

            const todoList = document.createElement("div");
            todoList.id = "todoList";

            const container = document.createElement("div");
            container.style.height = "auto";
            container.style.width = "30rem";
            container.style.backgroundColor = "#ffffff";
            container.style.borderRadius = "12px";
            container.style.padding = "24px";
            container.style.boxSizing = "border-box";
            container.style.boxShadow = "0 10px 20px rgba(0, 0, 0, 0.1)";

            const title = document.createElement("p");
            title.textContent = "To-do List";
            title.style.fontSize = "2.5rem";
            title.style.fontWeight = "700";
            title.style.color = "#063c76";
            title.style.marginBottom = "1.5rem";

            const list = document.createElement("ul");
            list.style.marginTop = "0";
            list.style.paddingLeft = "0";
            list.style.listStyle = "none";

            todos.forEach((item, index) => {
              const listItem = document.createElement("li");
              listItem.style.marginBottom = "1.25rem";

              const listItemDiv = document.createElement("div");
              listItemDiv.style.display = "flex";
              listItemDiv.style.alignItems = "center";
              listItemDiv.style.gap = "0.75rem";

              const todoContent = document.createElement("div");
              todoContent.style.width = "80%";
              todoContent.style.height = "3.5rem";
              todoContent.style.backgroundColor = "#e0ebff";
              todoContent.style.borderRadius = "8px";
              todoContent.style.display = "flex";
              todoContent.style.alignItems = "center";
              todoContent.style.padding = "0 1rem";
              todoContent.style.paddingRight = "1rem";

              const checkSpan = document.createElement("span");
              checkSpan.style.width = "2rem";
              checkSpan.style.height = "2rem";
              checkSpan.style.backgroundColor = "#ffffff";
              checkSpan.style.border = "2px solid #d1d9e6";
              checkSpan.style.borderRadius = "9999px";
              checkSpan.style.display = "flex";
              checkSpan.style.alignItems = "center";
              checkSpan.style.justifyContent = "center";
              checkSpan.style.cursor = "pointer";
              checkSpan.style.transition = "all 0.3s ease";

              const checkIcon = document.createElement("i");
              checkIcon.className = "text-white fa fa-check";
              checkIcon.style.display = "none";
              checkSpan.appendChild(checkIcon);

              const text = document.createElement("span");
              text.textContent = item;
              text.style.fontSize = "1.4rem";
              text.style.marginLeft = "1rem";
              text.style.color = "#5b7a9d";
              text.style.fontWeight = "600";

              checkSpan.onclick = () => {
                if (checkSpan.style.backgroundColor === "rgb(54, 211, 68)") {
                  checkSpan.style.backgroundColor = "#ffffff";
                  checkSpan.style.borderColor = "#d1d9e6";
                  checkIcon.style.display = "none";
                  text.style.textDecoration = "none";
                  text.style.color = "#5b7a9d";
                } else {
                  checkSpan.style.backgroundColor = "#36d344";
                  checkSpan.style.borderColor = "#36d344";
                  checkIcon.style.display = "block";
                  text.style.textDecoration = "line-through";
                  text.style.color = "#888";
                }
              };

              todoContent.appendChild(checkSpan);
              todoContent.appendChild(text);

              listItemDiv.appendChild(todoContent);

              listItem.appendChild(listItemDiv);
              list.appendChild(listItem);
            });

            container.appendChild(title);
            container.appendChild(list);
            todoList.appendChild(container);

            const recommendationsContainer = document.querySelector("#related");
            if (recommendationsContainer) {
              recommendationsContainer.insertAdjacentElement(
                "beforebegin",
                todoList
              );
            }
          });
        }
      );
    },
  });
};

updateButtonText();

modifyYouTubePage();

const notionBtn = document.getElementById("notion");
notionBtn.addEventListener("click", handleLoginLogout);

const notionData = document.getElementById("notionData");
notionData.addEventListener("click", handleData);
