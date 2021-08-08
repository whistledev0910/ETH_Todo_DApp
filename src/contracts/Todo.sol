// SPDX-License-Identifier: MIT

pragma solidity ^0.8.6;

contract TodoList {
    string public name;
    uint256 public taskCount = 0;

    struct Task {
        uint256 id;
        string content;
        bool completed;
        address author;
    }

    mapping(uint256 => Task) public tasks;

    event TaskCreated(
        uint256 id,
        string content,
        bool completed,
        address author
    );

    event TaskCompleted(uint256 id, bool completed);

    constructor() {
        name = "Welcome";
    }

    function createTask(string memory _content) public {
        require(bytes(_content).length > 0);
        // require(msg.sender != address(0));
        taskCount++;
        tasks[taskCount] = Task(taskCount, _content, false, msg.sender);
        emit TaskCreated(taskCount, _content, false, msg.sender);
    }

    function toggleCompleted(uint256 _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }

    function getTasks() public {}
}
