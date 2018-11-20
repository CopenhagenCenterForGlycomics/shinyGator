#' <Add Title>
#'
#' <Add Description>
#'
#' @import htmlwidgets
#'
#' @export
SeqViewer <- function(message, width = NULL, height = NULL, elementId = NULL) {

  # forward options using x
  x = list(
    message = message
  )

  # create widget
  htmlwidgets::createWidget(
    name = 'SeqViewer',
    x,
    width = width,
    height = height,
    package = 'shinyGator',
    elementId = elementId
  )
}

callJS <- function(method) {
  message <- Filter(function(x) !is.symbol(x), as.list(parent.frame(1)))
  session <- shiny::getDefaultReactiveDomain()
  method <- paste0("seqviewer:", method)
  message$method = method
  session$sendCustomMessage(method, message)
}

setUniprot <- function(id,uniprot) {
  callJS('setUniprot')
}

showRange <- function(id,min,max) {
  callJS('showRange')
}

showData <- function(id,dataframe) {
  callJS('showData')
}

#' Shiny bindings for SeqViewer
#'
#' Output and render functions for using SeqViewer within Shiny
#' applications and interactive Rmd documents.
#'
#' @param outputId output variable to read from
#' @param width,height Must be a valid CSS unit (like \code{'100\%'},
#'   \code{'400px'}, \code{'auto'}) or a number, which will be coerced to a
#'   string and have \code{'px'} appended.
#' @param expr An expression that generates a SeqViewer
#' @param env The environment in which to evaluate \code{expr}.
#' @param quoted Is \code{expr} a quoted expression (with \code{quote()})? This
#'   is useful if you want to save an expression in a variable.
#'
#' @name SeqViewer-shiny
#'
#' @export
SeqViewerOutput <- function(outputId, width = '100%', height = '400px'){
  htmlwidgets::shinyWidgetOutput(outputId, 'SeqViewer', width, height, package = 'shinyGator')
}

#' @rdname SeqViewer-shiny
#' @export
renderSeqViewer <- function(expr, env = parent.frame(), quoted = FALSE) {
  if (!quoted) { expr <- substitute(expr) } # force quoted
  htmlwidgets::shinyRenderWidget(expr, SeqViewerOutput, env, quoted = TRUE)
}
