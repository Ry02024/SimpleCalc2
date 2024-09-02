document.getElementById('pushForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const token = document.getElementById('token').value;
    const expression = document.getElementById('expression').value;
    const result = document.getElementById('result').value;

    const content = `式: ${expression}\n結果: ${result}`;
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));

    const filePath = 'calculation_result.txt';
    const repoUrl = `https://api.github.com/repos/Ry02024/SimpleCalc2/contents/${filePath}`;

    try {
        // まず、既存ファイルのSHAを取得
        const getFileResponse = await fetch(repoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        let sha = null;
        if (getFileResponse.ok) {
            const fileData = await getFileResponse.json();
            sha = fileData.sha;
        } else if (getFileResponse.status !== 404) {
            // 404エラー以外のエラーが発生した場合
            document.getElementById('pushResponse').textContent = `ファイルの取得に失敗しました: ${getFileResponse.statusText}`;
            return;
        }

        // ファイルを新規作成または更新
        const response = await fetch(repoUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: "Add calculation result",
                content: contentBase64,
                sha: sha  // 既存ファイルの場合はSHAを指定
            })
        });

        if (response.ok) {
            document.getElementById('pushResponse').textContent = 'ファイルが正常にGitHubにプッシュされました。';
        } else {
            const data = await response.json();
            document.getElementById('pushResponse').textContent = `エラー: ${data.message}`;
        }
    } catch (error) {
        document.getElementById('pushResponse').textContent = `リクエストエラー: ${error.message}`;
    }
});
