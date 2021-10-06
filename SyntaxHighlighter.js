// Calculate syntax highlighing for all elements of the class "codeSection"
function SyntaxHighlightElementsOnPage() {
  var elements = document.getElementsByClassName("codeSection");

  for (var i = 0; i < elements.length; i += 1) {
    SyntaxHighlightElement(elements[i]);
  }
}

// Calculate syntax highlighting for the given element
function SyntaxHighlightElement(element) {
  // Get the html code before syntax highlighting
  var innerHTML = element.innerHTML;

  // Stylize strings
  innerHTML = innerHTML.replaceAll('"', "'"); // Make sure all strings are indicated by single quotes
  while (innerHTML.includes("'")) {
    // Find start and end of string using the index of the single quotes
    var startIndex = innerHTML.search("'");
    var endIndex = startIndex + innerHTML.substring(startIndex + 1).search("'") + 1;
    // Add the style information before and after the string
    innerHTML = innerHTML.substring(0, startIndex) + '<span style="color:#CE723B">' + '"' + innerHTML.substring(startIndex + 1, endIndex) + '"' + "</span>" + innerHTML.substring(endIndex + 1);
  }

  // Stylize the "var" before each variable
  innerHTML = innerHTML.replaceAll("var ", '<span style="color:#569CCA">var </span>');

  // Stylize comments started with double slash
  var placeHoderStr = "DOUBLESLASHTOBEREPLACED";
  innerHTML = innerHTML.replaceAll("//", placeHoderStr); // To not enter an endless loop, replace the double slash with something temporary we can search and replace in the loop
  while (innerHTML.includes(placeHoderStr)) {
    // Find start and end of string using the index of the placeholderString
    var startIndex = innerHTML.search(placeHoderStr);
    var endIndex = startIndex + innerHTML.substring(startIndex + 1).search("\n") + 1;
    // Add the style information before and after the comment
    innerHTML = innerHTML.substring(0, startIndex) + '<span style="color:#529949">' + "//" + innerHTML.substring(startIndex + placeHoderStr.length, endIndex) + "</span>" + innerHTML.substring(endIndex);
  }

  // Todo: Stylize numbers
  // Todo: Stylize functions
  // Todo: Stylize variable names
  // Todo: Stylize multi line comments

  // Apply the changes to the element
  element.innerHTML = innerHTML;
}
