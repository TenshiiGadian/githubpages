/**
 * Lógica para mostrar los detalles del artículo y gestionar comentarios usando la API
 */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('article-detail-container');
    const commentsSection = document.getElementById('comments-section');
    const commentsList = document.getElementById('comments-list');
    const commentForm = document.getElementById('comment-form');

    // Función para obtener parámetros de la URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    const articleId = getQueryParam('id');

    if (!articleId) {
        container.innerHTML = `
            <div class="text-center">
                <h2>Artículo no encontrado</h2>
                <p style="color: var(--gray); margin-top: 1rem; margin-bottom: 2rem;">No se proporcionó un ID válido en la URL.</p>
                <a href="index.html" class="btn-primary">Volver al inicio</a>
            </div>
        `;
        return;
    }

    // 1. Cargar Artículo desde API
    async function loadArticle() {
        try {
            const response = await fetch(`api/get_article.php?id=${articleId}`);

            if (!response.ok) throw new Error('No encontrado');

            const article = await response.json();

            const formattedDate = new Date(article.created_at).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            container.innerHTML = `
                <a href="index.html#articles" class="back-link">
                    <span>&larr;</span> Volver a todos los artículos
                </a>
                <div class="article-detail-header">
                    <h1 class="article-detail-title">${article.title}</h1>
                    <p class="article-detail-date">Publicado el ${formattedDate}</p>
                </div>
                <div class="article-detail-content">${article.content}</div>
            `;

            // Mostrar sección de comentarios después de cargar con éxito el artículo
            if (commentsSection) {
                commentsSection.style.display = 'block';
                loadComments();
            }

        } catch (error) {
            container.innerHTML = `
                <div class="text-center">
                    <h2>Artículo no encontrado</h2>
                    <p style="color: var(--gray); margin-top: 1rem; margin-bottom: 2rem;">El artículo que buscas no existe o ha sido eliminado.</p>
                    <a href="index.html" class="btn-primary">Volver al inicio</a>
                </div>
            `;
        }
    }

    // 2. Cargar Comentarios desde API
    async function loadComments() {
        try {
            const res = await fetch(`api/get_comments.php?article_id=${articleId}`);
            if (!res.ok) throw new Error('Error al cargar');
            const comments = await res.json();

            commentsList.innerHTML = '';

            if (comments.length === 0) {
                commentsList.innerHTML = '<p style="color: var(--gray);">Aún no hay comentarios. ¡Sé el primero en opinar!</p>';
                return;
            }

            comments.forEach(comment => {
                const date = new Date(comment.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });

                const div = document.createElement('div');
                div.className = 'glass';
                div.style.padding = '1.8rem';
                div.style.borderLeft = '4px solid var(--primary)';

                // Mostrar el nombre o "Anónimo" de forma elegante y limpia
                div.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <strong style="font-size: 1.1rem; color: var(--secondary);">${comment.author_name}</strong>
                        <span style="color: var(--gray); font-size: 0.85rem;">${date}</span>
                    </div>
                    <p style="margin: 0; color: var(--light); line-height: 1.6;">${comment.content}</p>
                `;
                commentsList.appendChild(div);
            });

        } catch (error) {
            commentsList.innerHTML = '<p style="color: red;">No se pudieron cargar los comentarios.</p>';
        }
    }

    // 3. EVENTO: Enviar un nuevo Comentario
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const authorVal = document.getElementById('comment-author').value.trim();
            const contentVal = document.getElementById('comment-content').value.trim();

            if (!contentVal) return;

            try {
                const btn = commentForm.querySelector('button');
                const originalText = btn.textContent;
                btn.textContent = 'Enviando...';
                btn.disabled = true;

                const res = await fetch('api/create_comment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        article_id: articleId,
                        author_name: authorVal,
                        content: contentVal
                    })
                });

                if (res.ok) {
                    commentForm.reset();
                    loadComments(); // Recargar la lista de forma reactiva
                } else {
                    alert('Hubo un error al guardar tu comentario en la Base de Datos.');
                }

                btn.textContent = originalText;
                btn.disabled = false;

            } catch (error) {
                console.error(error);
                alert('Fallo de conexión al enviar el comentario.');
            }
        });
    }

    // Iniciar con la carga del artículo
    loadArticle();
});
