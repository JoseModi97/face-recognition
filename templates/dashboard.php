<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/css/uikit.min.css" />
</head>
<body>
    <?php include 'loader.php'; ?>
    <div class="uk-container uk-container-xsmall uk-padding">
        <h1 class="uk-heading-medium">Dashboard</h1>
        <p>Welcome, <?php echo $_SESSION['email']; ?>!</p>
        <a href="/users" class="uk-button uk-button-primary">View Users</a>
        <a href="/logout" class="uk-button uk-button-danger">Logout</a>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/js/uikit.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/uikit@3.21.5/dist/js/uikit-icons.min.js"></script>
</body>
</html>
