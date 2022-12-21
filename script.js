const Api = (() => {
  const url = 'http://localhost:4232/courseList';

  const getCro = () => fetch(url).then((response) => response.json());
  return {
    getCro,
  };
})();

const View = (() => {
  const domstr = {
    selectbtn: '#selectbtn',
    totalcredit: '#totalcredit',
    select: '.selection-main',
    selected: '.selected-main',
  };
  const createCour = (arr) => {
    let tmp = '';
    arr.forEach((cor) => {
      var corType = cor.required == false ? 'Elective' : 'Compulsory';
      tmp += `
      <p class="doselect" id='${cor.courseId}'>${cor.courseName}<br>Course type: ${corType}<br>Course Credict: ${cor.credit}</p>
      `;
    });

    return tmp;
  };
  const createCre = (cre) => {
    let tmp = '';
    tmp += `Total credit:<span id="credit">${cre}</span>`;
    return tmp;
  };
  const render = (ele, tmp) => {
    ele.innerHTML = tmp;
  };
  const pagerender = (select_courses, selected_courses, totalcredit) => {
    const selectcourse = document.querySelector(domstr.select);
    const tmp1 = createCour(select_courses);

    const selectedcourse = document.querySelector(domstr.selected);
    const tmp2 = createCour(selected_courses);

    const total_credit = document.querySelector(domstr.totalcredit);
    const tmp3 = createCre(totalcredit);

    render(selectcourse, tmp1);
    render(selectedcourse, tmp2);
    render(total_credit, tmp3);
  };
  const pagecrerender = (totalcredit) => {
    const total_credit = document.querySelector(domstr.totalcredit);
    const tmp3 = createCre(totalcredit);
    render(total_credit, tmp3);
  };
  return {
    domstr,
    createCour,
    createCre,
    render,
    pagerender,
    pagecrerender,
  };
})();
const Model = ((api) => {
  const { getCro } = api;
  class State {
    #courses = [];
    #selectedCour = [];
    #credit = 0;

    get courses() {
      return this.#courses;
    }

    set courses(newcourse) {
      this.#courses = newcourse;
    }

    get selectedCour() {
      return this.#selectedCour;
    }
    set selectedCour(Cour) {
      this.#selectedCour = Cour;
    }
    get credit() {
      return this.#credit;
    }
    set credit(num) {
      this.#credit = num;
    }
  }
  return { getCro, State };
})(Api);
const Controller = ((model, view) => {
  const state = new model.State();
  const init = () => {
    model.getCro().then((cor) => {
      state.courses = cor;
      state.selectedCour = [];
      view.pagerender(state.courses, state.selectedCour, state.credit);
    });
  };

  const select = () => {
    //var selectul=document.querySelector(view.domstr.select);
    window.addEventListener('click', (event) => {
      var flag = true;
      if (event.target.className == 'doselect') {
        for (let i = 0; i < state.courses.length; i++) {
          if (event.target.id == state.courses[i].courseId) {
            if (state.credit + state.courses[i].credit <= 18) {
              state.credit += state.courses[i].credit;
              state.selectedCour.push(state.courses[i]);
              event.target.classList.add('style');
            } else {
              alert('You can only choose up to 18 credits in one semester');
              flag = false;
            }
          }
        }
        //console.log(state.selectedCour);
        if (flag == true) {
          state.courses = state.courses.filter(
            (item) => item.courseId != event.target.id
          );
          view.pagecrerender(state.credit);
        }
        //console.log(state.courses);
      } else if (event.target.className == 'doselect style') {
        event.target.classList.remove('style');

        for (let i = 0; i < state.selectedCour.length; i++) {
          if (event.target.id == state.selectedCour[i].courseId) {
            state.credit -= state.selectedCour[i].credit;
            state.courses.push(state.selectedCour[i]);
          }
        }
        state.selectedCour = state.selectedCour.filter(
          (item) => item.courseId != event.target.id
        );
        view.pagecrerender(state.credit);
      }
    });

    var getbtn = document.querySelector(view.domstr.selectbtn);

    getbtn.addEventListener('click', () => {
      if (state.credit > 18) {
        alert('You can only choose up to 18 credits in one semester');
      } else {
        const response = confirm(
          'You have chosen ' +
            state.credit +
            ' credits for this semester. You cannot change once you submit. Do you want to confirm?'
        );

        if (response) {
          view.pagerender(state.courses, state.selectedCour, state.credit);
        }
      }
    });
  };

  const bootstrap = () => {
    init(), select();
  };

  return { bootstrap };
})(Model, View);
Controller.bootstrap();
