const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty();

    let startIndex, endIndex;
  
    if (currentPage == 1 || currentPage == 2) {
      startIndex = 1;
      endIndex = 5;
    } else {
      startIndex = currentPage - 2;
      if (currentPage == numPages - 1 || currentPage == numPages) {
        endIndex = numPages;
        startIndex = numPages - 4;
      } else {
        endIndex = currentPage + 2;
      }
    }
    console.log("startIndex: ", startIndex);
    console.log("endIndex: ", endIndex);
    console.log("numPages: ", numPages);
    console.log("currentPage: ", currentPage);
  
    if (!(currentPage == 1)) {
      $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="1">Start</button>
      `);

      $("#pagination").append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${
          currentPage - 1
        }">Prev</button>
        `);
    }
  
    for (let i = startIndex; i <= endIndex; i++) {
      var active = "";
      if (i == currentPage) {
        active = "active";
      } 
      $("#pagination").append(`
        <button class="btn btn-primary page ml-1 numberedButtons ${active}" value="${i}">${i}</button>
        `);
    }
  
    if (!(currentPage == numPages)) {
      $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${
        currentPage + 1
      }" style="margin-left: 20px;">Next</button>
      `);

      $("#pagination").append(`
      <button class="btn btn-primary page ml-1 numberedButtons" value="${numPages}">Last</button>
      `);
    }
  };

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  const selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Get the selected checkbox IDs
  const selectedCheckboxes = $('.typeCheckbox:checked').map((_, checkbox) => checkbox.value).get();

  // Filter the selected pokemons based on the selected checkbox IDs
  const filtered_pokemons = selectedCheckboxes.length > 0 ? selected_pokemons.filter(pokemon => {
    return pokemon.types.some(type => selectedCheckboxes.includes(type.type.name));
  }) : selected_pokemons;

  // Display the cards
  $('#pokeCards').empty();
  $('#pokeCards').append(`<div style="width: 100%;"><h2>Showing ${filtered_pokemons.length} of ${pokemons.length} pokemons</h2></div>`);
  filtered_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}>
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
      </div>  
    `);
  });
}

const displayFilters = async () => {
  // display the filters

  $("#pokeFilters").empty();
  $("#pokeFilters").append(`
    <div class="">
      <div class="row">
        <div class="col">
          <div class="form-check form-check-inline">
          </div>
        </div>
      </div>
    </div>
  `);

  try {
    const filterResponse = await axios.get('https://pokeapi.co/api/v2/type/');
    const filterResults = filterResponse.data.results;

    // Iterate over filterResults and dynamically create checkbox options
    filterResults.forEach((result, index) => {
      console.log("filter name: ", result.name);
      const checkboxId = result.name;
      const checkboxLabel = result.name;

      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("id", checkboxId);
      checkbox.classList.add("form-check-input");

      const label = document.createElement("label");
      label.setAttribute("for", checkboxId);
      label.classList.add("form-check-label");
      label.innerText = checkboxLabel;

      const checkboxContainer = document.createElement("div");
      checkboxContainer.classList.add("form-check", "form-check-inline");
      checkboxContainer.appendChild(checkbox);
      checkboxContainer.appendChild(label);

      const container = document.querySelector(".container");
      const row = document.querySelector(".row");
      const col = document.querySelector(".col");
      col.appendChild(checkboxContainer);
    });
  } catch (error) {
    console.error('Error fetching filter results:', error);
  }
}

const setup = async () => {

  // test out poke api using axios here
  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;

  displayFilters();
  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}</ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}</ul>

        </div>
        </div>
          <h3>Types</h3>
          <ul>${types.map((type) => `<li>${type}</li>`).join('')}</ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons);

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
  })

}

$(document).ready(setup);