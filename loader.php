<style>
    .skeleton-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #f0f0f0;
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .skeleton-loader .uk-card {
        width: 80%;
        max-width: 600px;
    }
</style>
<div id="skeleton-loader" class="skeleton-loader">
    <div class="uk-card uk-card-default uk-card-body">
        <div class="uk-grid-small uk-flex-middle" uk-grid>
            <div class="uk-width-auto">
                <div class="uk-background-muted uk-border-circle" style="width: 40px; height: 40px;"></div>
            </div>
            <div class="uk-width-expand">
                <div class="uk-background-muted uk-text-lead" style="height: 20px; width: 80%;"></div>
                <div class="uk-background-muted uk-text-meta uk-margin-small-top" style="height: 14px; width: 60%;"></div>
            </div>
        </div>
        <div class="uk-margin-top">
            <div class="uk-background-muted" style="height: 200px;"></div>
        </div>
        <div class="uk-margin-top">
            <div class="uk-background-muted" style="height: 40px;"></div>
        </div>
    </div>
</div>
<script>
    if (window.location.pathname.includes('register.html') || window.location.pathname.includes('dashboard.php')) {
        document.addEventListener("DOMContentLoaded", function() {
            document.getElementById("skeleton-loader").style.display = "none";
        });
    }
</script>
