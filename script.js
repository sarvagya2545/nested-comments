/*

    Basic comment data structure: 

    [
        {
            author: String,
            text: String,
            replies: [Comment],
            likes: 0,
            dislikes: 0
        }
    ]

*/

let UIcontroller = (function() {
    let root = document.querySelector('.comment-list');

    function createReplyHtml(data, location, index) {
        const html = `
            <div class="comment-container" data-location="%LOCATION%">
                <div class="comment">
                    <div class="text">%TEXT%</div>
                    <div class="author">%AUTHOR%</div>
                    <div class="bottom">
                        <div class="buttons">
                            <button><span>0</span> &uarr;</button>
                            <button>&darr; <span>0</span></button>
                        </div>
                        <form class="reply">
                            <input type="text" name="text" id="reply" placeholder="Reply">
                            <button type="submit">Reply</button>
                        </form>
                    </div>
                </div>
                <div class="replies"></div>
            </div>
        `;

        let locationString = location.map(num => `${num}`).join('-');
        // console.log('locationString', locationString);

        const newHtml = html
            .replace('%TEXT%', data.text)
            .replace('%AUTHOR%', data.author)
            .replace('%LOCATION%', `${locationString}${location.length ? '-' : ''}${index}`);

        // console.log(html);
        // console.log(newHtml);
        
        return newHtml;
    }

    function getTargetNode(location, currentNode = root) {
        // console.log(location);
        if(location.length === 0) {
            return currentNode;
        }

        let [ index, ...newLocation ] = location;
        newLocation = newLocation || [];
        let newNode = currentNode.children[index].children[1];
        // console.log(index, newNode);
        return getTargetNode(newLocation, newNode);
    }

    function addCommentUI(data, location, index) {
        const currentNode = getTargetNode(location);
        const html = createReplyHtml(data, location, index);
        // console.log('currentNode', currentNode);
        currentNode.insertAdjacentHTML('beforeend', html);
    }

    function addVoteUI(location, inc) {
        let currentNode = root;

        for(let i = 0; i < location.length - 1; i++) {
            currentNode = currentNode.children[location[i]].children[1];
        }

        let btnsArr = currentNode
            .children[location[0]]
            .children[0]
            .children[2]
            .children[0];

        if(inc) {
            let num = btnsArr.children[0].children[0].innerHTML;
            btnsArr.children[0].children[0].innerHTML = (parseInt(num) + 1).toString();
        } else {
            let num = btnsArr.children[1].children[0].innerHTML;
            btnsArr.children[1].children[0].innerHTML = (parseInt(num) + 1).toString();
        }
    }

    return {
        addCommentUI,
        addVoteUI
    }

})();

let LogicController = (function() {

    let commentsList = [];

    function addCommentData(data, location, nestedCommentsList = commentsList) {
        if(location.length === 0) {
            // push the comment to the location
            nestedCommentsList.push({
                author: data.author,
                text: data.text,
                replies: [],
                likes: 0,
                dislikes: 0
            });
            // console.log(commentsList);
            return nestedCommentsList.length - 1;
        }

        // else recursively call the above function
        let [ index, ...newLocation ] = location;

        return addCommentData(data, newLocation, nestedCommentsList[index].replies);
    }

    function getCommentsList() {
        return commentsList;
    }

    function addVoteData(location, inc) {
        let nestedCommentsList = commentsList;
        for(let i = 0; i < location.length - 1; i++) {
            nestedCommentsList = nestedCommentsList[location[i]].replies;
        }
        if(inc)
            nestedCommentsList[location[0]].likes++;
        else
            nestedCommentsList[location[0]].dislikes++;
    }

    return {
        addCommentData,
        getCommentsList,
        addVoteData
    }

})();

let mainController = (function(ui, logic) {

    const commentBox = document.querySelector('form#comment-box');

    function addAllEventListeners() {
        commentBox.addEventListener('submit', e => {
            e.preventDefault();
            // console.log(e.target);
            const formData = new FormData(e.target);

            const data = {};
            for(var [key, value] of formData.entries()) {
                data[key] = value;
            }

            if(!data.author) data.author = 'Anonymous';

            addComment(data, []);
            commentBox.elements['text'].value = '';
        })
    }

    function newAddEventListeners(location,index) {
        const locationString = location.join('-');
        const qString = `${locationString}${location.length ? '-' : ''}${index}`;
        locationElement = document.querySelector(`[data-location='${qString}']`);
        // console.log('loc', qString);
        // console.log(locationElement.children[0].children[2].children[1]);
        const replyForm = locationElement.children[0].children[2].children[1]
        const buttonsPallette = locationElement.children[0].children[2].children[0];
        const upvoteBtn = buttonsPallette.children[0];
        const downvoteBtn = buttonsPallette.children[1];

        replyForm.addEventListener('submit', e => {
            e.preventDefault();
            locationArray = 
                e.target
                    .parentElement
                    .parentElement
                    .parentElement
                    .dataset['location']
                    .split('-')
                    .map(el => parseInt(el))
            ;

            const formData = new FormData(e.target);

            const data = {};
            for(var [key, value] of formData.entries()) {
                data[key] = value;
            }

            if(!data.author) data.author = 'Anonymous';
            // console.log(data, locationArray);

            addComment(data, locationArray);
            replyForm.elements['text'].value = '';
        });


        upvoteBtn.addEventListener('click', e => {
            let elem = e.target;
            while(!elem.dataset['location'])
                elem = elem.parentElement;

            // console.log(elem);
            locationArray = elem.dataset['location']
                    .split('-')
                    .map(el => parseInt(el))
            ;

            upvoteComment(locationArray);
        });

        downvoteBtn.addEventListener('click', e => {
            let elem = e.target;
            while(!elem.dataset['location'])
                elem = elem.parentElement;

            locationArray = elem.dataset['location']
                    .split('-')
                    .map(el => parseInt(el))
            ;
            
            downvoteComment(locationArray);
        })
    }

    function addComment(data, location) {
        index = logic.addCommentData(data, location);
        // console.log(index);
        ui.addCommentUI(data, location, index);
        newAddEventListeners(location, index);
    }

    function upvoteComment(location) {
        logic.addVoteData(location, true);
        ui.addVoteUI(location, true);
    }

    function downvoteComment(location) {
        logic.addVoteData(location, false);
        ui.addVoteUI(location, false);
    }

    return {
        addAllEventListeners,
        addComment
    }

})(UIcontroller, LogicController);

mainController.addAllEventListeners();

// exposing commentslist for testing purposes only;
// let addComment = LogicController.addComment;
let addCommentUI = UIcontroller.addCommentUI;
// let getCommentsList = LogicController.getCommentsList;
let addComment = mainController.addComment;  