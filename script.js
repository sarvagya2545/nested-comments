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
                            <button>1 &uarr;</button>
                            <button>&darr; 2</button>
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

    return {
        addCommentUI
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

    return {
        addCommentData,
        getCommentsList
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

    function newAddEventListener(location,index) {
        const locationString = location.join('-');
        const qString = `${locationString}${location.length ? '-' : ''}${index}`;
        locationElement = document.querySelector(`[data-location='${qString}']`);
        // console.log('loc', qString);
        // console.log(locationElement.children[0].children[2].children[1]);
        const replyForm = locationElement.children[0].children[2].children[1]
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
        })
    }

    function addComment(data, location) {
        index = logic.addCommentData(data, location);
        // console.log(index);
        ui.addCommentUI(data, location, index);
        newAddEventListener(location, index);
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