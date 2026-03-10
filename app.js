/**
 * Lógica principal para la Landing Page conectada a PostgreSQL PHP API
 */

document.addEventListener('DOMContentLoaded', () => {
    const articlesContainer = document.getElementById('articles-container');

    async function loadArticlesFromAPI() {
        try {
            const response = await fetch('api/get_articles.php');
            const responseText = await response.text();

            let articles;
            try {
                articles = JSON.parse(responseText);
            } catch (err) {
                // Si el servidor falla y lanza texto PHP plano (error 500, o código crudo)
                throw new Error(`Fallo de lectura del servidor. Detalles de error:\n\n${responseText}`);
            }

            if (!response.ok) {
                throw new Error(articles.error || articles.message || `Error del servidor HTTP ${response.status}`);
            }

            if (articles.length === 0) {
                articlesContainer.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                        <p style="color: var(--gray); font-size: 1.1rem;">
                            No hay publicaciones disponibles en este momento. 
                            <br><br>
                            ¡Accede al Dashboard y crea el primer post!
                        </p>
                    </div>
                `;
                return;
            }

            articlesContainer.innerHTML = '';

            articles.forEach(article => {
                const link = document.createElement('a');
                link.href = `article.html?id=${article.id}`;
                link.style.textDecoration = 'none';
                link.style.color = 'inherit';
                link.style.display = 'block';

                const card = document.createElement('article');
                card.className = 'article-card';

                const excerpt = article.content.length > 120
                    ? article.content.substring(0, 120) + '...'
                    : article.content;

                const formattedDate = new Date(article.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

                card.innerHTML = `
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-excerpt">${excerpt}</p>
                    <div class="article-date">${formattedDate}</div>
                `;

                link.appendChild(card);
                articlesContainer.appendChild(link);
            });
        } catch (error) {
            console.error(error);
            articlesContainer.innerHTML = `
                <div style="grid-column: 1 / -1; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; padding: 2rem; border-radius: 12px; box-shadow: 0 5px 15px rgba(239,68,68,0.2);">
                    <h3 style="color: #ef4444; margin-bottom: 1rem;">🚨 Error del Servidor / Base de Datos detectado</h3>
                    <p style="color: var(--light); margin-bottom: 1rem; font-size: 0.9rem;">
                        El sistema intentó obtener los datos pero chocó con el siguiente problema técnico:
                    </p>
                    <pre style="color: #f8fafc; font-family: monospace; font-size: 0.85rem; background: #000; padding: 1rem; border-radius: 8px; overflow-x: auto; white-space: pre-wrap;">${error.message}</pre>
                </div>`;
        }
    }

    loadArticlesFromAPI();
});
