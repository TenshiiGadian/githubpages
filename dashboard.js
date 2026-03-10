/**
 * Lógica para la gestión del Dashboard conectado a la Base de Datos PostgreSQL
 */

document.addEventListener('DOMContentLoaded', () => {
    const articleForm = document.getElementById('article-form');
    const dashboardArticleList = document.getElementById('dashboard-article-list');
    const clearAllBtn = document.getElementById('clear-all');

    // Ocultar el botón de borrar todo temporalmente o adaptarlo
    clearAllBtn.style.display = 'none';

    async function renderManagementList() {
        dashboardArticleList.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 2rem 0;">Cargando artículos...</p>';

        try {
            const response = await fetch('api/get_articles.php');
            const responseText = await response.text();

            let articles;
            try {
                articles = JSON.parse(responseText);
            } catch (err) {
                throw new Error(`Fallo del servidor (PHP/DB):\n\n${responseText}`);
            }

            if (!response.ok) throw new Error(articles.error || articles.message || 'Error de conexión HTTP ' + response.status);

            dashboardArticleList.innerHTML = '';

            if (articles.length === 0) {
                dashboardArticleList.innerHTML = `
                    <p style="color: var(--gray); text-align: center; padding: 2rem 0;">
                        Aún no has escrito ningún artículo.
                    </p>
                `;
                return;
            }

            articles.forEach(article => {
                const item = document.createElement('div');
                item.className = 'dashboard-article-item';

                // Usar created_at proveniente de SQL
                const renderDate = new Date(article.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });

                item.innerHTML = `
                    <div>
                        <h4>${article.title}</h4>
                        <p>${renderDate}</p>
                    </div>
                    <button class="btn-danger btn-delete" data-id="${article.id}" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-radius: 8px;">
                        Eliminar
                    </button>
                `;

                dashboardArticleList.appendChild(item);
            });

            // Registrar los eventos de los botones "Eliminar"
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idToDelete = e.target.getAttribute('data-id');
                    deleteArticle(idToDelete);
                });
            });

        } catch (error) {
            dashboardArticleList.innerHTML = `
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 1.5rem; border-radius: 12px; margin-top: 1rem;">
                    <p style="color: #ef4444; font-weight: bold; margin-bottom: 0.5rem;">🚨 Error detectado en el Log:</p>
                    <pre style="color: var(--light); font-family: monospace; font-size: 0.8rem; background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; overflow-x: auto; white-space: pre-wrap;">${error.message}</pre>
                </div>`;
        }
    }

    // Evento para guardar un nuevo artículo
    articleForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titleVal = document.getElementById('title').value.trim();
        const contentVal = document.getElementById('content').value.trim();

        if (!titleVal || !contentVal) return alert('Por favor, completa los campos requeridos.');

        const submitBtn = articleForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Publicando...';
        submitBtn.disabled = true;

        try {
            const response = await fetch('api/create_article.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: titleVal,
                    content: contentVal
                })
            });

            const textResponse = await response.text();
            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                throw new Error(textResponse);
            }

            if (response.ok) {
                articleForm.reset();
                renderManagementList();
                alert('¡Tu artículo fue publicado con éxito en la Base de Datos!');
            } else {
                alert('No se pudo guardar el artículo. \nMotivo: ' + (data.error || data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error(error);
            alert('Fallo del Servidor / Base de Datos: \n\n' + error.message);
        }

        submitBtn.textContent = 'Publicar Artículo';
        submitBtn.disabled = false;
    });

    // Función para eliminar un artículo
    async function deleteArticle(articleId) {
        if (confirm('¿Estás seguro de que deseas eliminar permanentemente este artículo de la Base de Datos?')) {
            try {
                const response = await fetch('api/delete_article.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: articleId })
                });

                if (response.ok) {
                    renderManagementList();
                } else {
                    alert('Hubo un error tratando de borrar el artículo');
                }
            } catch (error) {
                alert('Fallo de red.');
            }
        }
    }

    // Inicializar visualización de artículos cargados
    renderManagementList();
});
