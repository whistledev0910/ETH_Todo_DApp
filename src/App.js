/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Web3 from "web3";
import TodoList from "./abis/TodoList.json";

const App = () => {
  const [account, setAccount] = useState("");
  const [todoList, setTodoList] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [taskInput, setTaskInput] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.web3.eth.getAccounts();
      setAccount(accounts[0]);
      const web3 = window.web3;
      const networkId = await web3.eth.net.getId();
      const networkData = TodoList.networks[networkId];
      const _todoList = new web3.eth.Contract(
        TodoList.abi,
        networkData.address
      );
      setTodoList(_todoList);
      const _taskCount = await _todoList.methods.taskCount().call();
      setTaskCount(_taskCount);
      window.ethereum.on("accountsChanged", (accounts) => {
        window.location.reload();
      });
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };

  const loadBlockchainData = async () => {
    setLoading(true);
    const _taskCount = await todoList?.methods?.taskCount().call();
    const arr = [];
    for (var i = 1; i <= _taskCount; i++) {
      const task = await todoList.methods.tasks(i).call();
      arr.push(task);
    }
    setTasks(arr);
    setTaskCount(_taskCount);
    setLoading(false);
  };

  const createTask = async (content) => {
    await todoList?.methods
      .createTask(content)
      .send({ from: account })
      .once("receipt", (receipt) => {
        setLoading(true);
        setTaskInput("");
        toast({
          title: "Success",
          description: "You created a new task.",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      });
  };

  const toggleCompleted = async (id) => {
    await todoList?.methods
      .toggleCompleted(id)
      .send({ from: account })
      .once("receipt", (receipt) => {
        setLoading(true);
        toast({
          title: "Success",
          description: "You updated a task.",
          status: "success",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      })
      .on("error", (error, result) => {
        loadBlockchainData();
        toast({
          title: "Reject",
          description: "You rejected a transaction.",
          status: "warning",
          duration: 2000,
          isClosable: true,
          position: "top",
        });
      });
  };

  const handleEventOnKeyDown = (key) => {
    if (key === "Enter") {
      createTask(taskInput);
    }
  };

  const BgColor = (color1, color2) => {
    useColorModeValue(color1, color2);
  };

  const renderTask = () => {
    let xhtml = null;

    if (tasks.length > 0) {
      xhtml = tasks.map((i, index) => (
        <Flex align="center" key={index} mb={2}>
          <Checkbox
            colorScheme="green"
            defaultChecked={i.completed}
            name={i.id}
            onChange={(e) => toggleCompleted(e.target.name)}
          />
          <Text
            ml={3}
            fontSize={{ base: "sm", sm: "md" }}
            fontWeight={600}
            color={i.completed ? "gray.400" : "gray.600"}
            decoration={i.completed && "line-through"}
          >
            {i.content}
          </Text>
        </Flex>
      ));
    } else {
      xhtml = (
        <Text
          ml={3}
          fontSize={{ base: "sm", sm: "md" }}
          fontWeight={600}
          color="gray.600"
        >
          Don't have task!!!
        </Text>
      );
    }

    return xhtml;
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  useEffect(() => {
    loadBlockchainData();
  }, [taskCount]);

  useEffect(() => {
    if (loading) {
      loadBlockchainData();
    }
  }, [loading]);

  return (
    <Box>
      {!account ? (
        <Center h="100vh">
          <Stack
            maxW={"md"}
            bg={BgColor("white", "gray.700")}
            rounded={"xl"}
            boxShadow={"lg"}
            p={6}
            my={12}
          >
            <Heading
              lineHeight={1.1}
              fontSize={{ base: "xl", md: "2xl" }}
              textAlign="center"
              mb={3}
            >
              You have not logged in Metamask. Click here to try again
            </Heading>

            <Stack spacing={6}>
              <Button
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
                onClick={loadWeb3}
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Center>
      ) : (
        <Flex flexDir="column" h="100vh">
          <Flex
            align={"center"}
            justify={"center"}
            bg={BgColor("white", "gray.800")}
            h="100%"
          >
            <Stack
              spacing={4}
              w={"full"}
              maxW={"md"}
              bg={BgColor("white", "gray.700")}
              rounded={"xl"}
              boxShadow={"lg"}
              p={6}
              my={12}
            >
              <Heading lineHeight={1.1} fontSize={{ base: "2xl", md: "3xl" }}>
                New Task
              </Heading>
              <FormControl id="email">
                <Input
                  placeholder="Làm gì em đi anh 👌"
                  _placeholder={{ color: "gray.500" }}
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={(e) => handleEventOnKeyDown(e.key)}
                />
              </FormControl>
              <Stack spacing={6}>
                <Button
                  bg={"blue.400"}
                  color={"white"}
                  _hover={{
                    bg: "blue.500",
                  }}
                  onClick={() => createTask(taskInput)}
                >
                  Create
                </Button>
              </Stack>
            </Stack>
            <Stack
              spacing={4}
              w={"full"}
              maxW={"md"}
              bg={BgColor("white", "gray.700")}
              rounded={"xl"}
              boxShadow={"lg"}
              p={6}
              my={12}
              ml={3}
            >
              <FormControl id="email">
                <Flex flexDir="column">
                  <Heading textAlign="center">List task</Heading>
                  <Divider my={3} />

                  {loading ? (
                    <Center>
                      <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                      />
                    </Center>
                  ) : (
                    renderTask()
                  )}
                  <Divider my={3} />
                </Flex>
              </FormControl>
            </Stack>
          </Flex>
        </Flex>
      )}
    </Box>
  );
};

export default App;
