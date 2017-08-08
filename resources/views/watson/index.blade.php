<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
    <head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <title>watson</title>
        <link href='https://fonts.googleapis.com/css?family=Slabo+27px' rel='stylesheet' type='text/css'>
        <link rel="stylesheet" href="css/main.css">
    </head>
    <body>
        <div class="watson-container">
            <header>
                <h1>Sapient Bot Knows Best</h1>
            </header>

            <div class="content">
                <span id="record" class="circle"></span>

                <form action="/" method="POST">
                    <input type="hidden" name="_token" id="token" value="<?php echo csrf_token(); ?>">
                    <input type="text" autocomplete="off" value="" name="search" id="search" placeholder="whats up?" />
                    <input type="submit" value="ask" />
                </form>
            </div>

            <ul></ul>
        </div>
        <script src="//code.jquery.com/jquery-1.12.0.min.js"></script>
        <script src="js/vendor/model_pca_20_svm.js"></script>
        <script src="js/app.min.js" type="text/javascript"></script>
    </body>
</html>
